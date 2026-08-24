import { create } from "zustand";
import type { AccountConnection, ConnectionStatus } from "@/types";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/lib/constants";
import { api } from "@/lib/api";
import type { AxiosError } from "axios";

// Default clean state for all supported platforms without fabricated data.
const defaultConnections: Record<SocialPlatform, AccountConnection> = {
  facebook: { platform: "facebook", status: "not_connected" },
  instagram: { platform: "instagram", status: "not_connected" },
  linkedin: { platform: "linkedin", status: "not_connected" },
  twitter: { platform: "twitter", status: "not_connected" },
  youtube: { platform: "youtube", status: "not_connected" },
  pinterest: { platform: "pinterest", status: "not_connected" },
};

/**
 * Isolated mapping helper for GET /api/social/accounts response.
 * Uses confirmed response shape:
 * - id: internal backend database ID (response.id) used for social_account_id & DELETE
 * - account_name: displayed account handle
 * - is_connected: boolean connection status
 */
function mapBackendAccountsResponse(data: unknown): Partial<Record<SocialPlatform, AccountConnection>> {
  const mapped: Partial<Record<SocialPlatform, AccountConnection>> = {};

  if (Array.isArray(data)) {
    for (const item of data) {
      if (!item || typeof item !== "object") continue;
      const record = item as Record<string, unknown>;
      const platformRaw = (record.platform || record.provider) as string | undefined;
      const platform = platformRaw?.toLowerCase() as SocialPlatform | undefined;

      if (platform && SOCIAL_PLATFORMS.includes(platform)) {
        const isConnected = record.is_connected === true;
        const internalId = record.id !== undefined ? (record.id as number | string) : undefined;
        const status: ConnectionStatus = isConnected ? "connected" : "not_connected";

        mapped[platform] = {
          id: internalId,
          accountId: internalId,
          platform,
          status,
          handle: typeof record.account_name === "string" ? record.account_name : typeof record.handle === "string" ? record.handle : undefined,
          lastSyncedAt: typeof record.updated_at === "string" ? record.updated_at : typeof record.created_at === "string" ? record.created_at : undefined,
        };
      }
    }
  } else if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.accounts)) {
      return mapBackendAccountsResponse(obj.accounts);
    }
  }

  return mapped;
}

interface AccountsState {
  connections: Record<SocialPlatform, AccountConnection>;
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  fetchAccounts: () => Promise<void>;
  connect: (platform: SocialPlatform) => Promise<void>;
  disconnect: (platform: SocialPlatform) => Promise<void>;
  reconnect: (platform: SocialPlatform) => Promise<void>;
  sync: (platform: SocialPlatform) => Promise<void>;
  clearError: () => void;
}

export const useAccountsStore = create<AccountsState>((set, get) => ({
  connections: defaultConnections,
  isLoading: false,
  hasLoaded: false,
  error: null,

  clearError: () => set({ error: null }),

  /**
   * Fetches real connected accounts from GET /api/social/accounts.
   */
  fetchAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/social/accounts");
      const mapped = mapBackendAccountsResponse(res.data);
      set((s) => ({
        connections: {
          ...s.connections,
          ...mapped,
        },
        isLoading: false,
        hasLoaded: true,
      }));
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>;
      const detail = axiosErr.response?.data?.detail;
      set({
        isLoading: false,
        hasLoaded: true,
        error: detail ?? "Failed to fetch connected accounts from server.",
      });
    }
  },

  /**
   * Requests real OAuth authorization URL from GET /api/social/auth-url/{platform}
   * and navigates browser to the returned auth_url.
   */
  connect: async (platform) => {
    set((s) => ({
      connections: {
        ...s.connections,
        [platform]: { ...s.connections[platform], status: "connecting" },
      },
      error: null,
    }));

    try {
      const res = await api.get<{ platform?: string; auth_url: string; redirect_uri?: string }>(
        `/social/auth-url/${platform}`
      );

      if (res.data?.auth_url) {
        window.location.href = res.data.auth_url;
      } else {
        throw new Error("No authorization URL returned by backend.");
      }
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>;
      const detail = axiosErr.response?.data?.detail || axiosErr.message;
      set((s) => ({
        connections: {
          ...s.connections,
          [platform]: { ...s.connections[platform], status: "not_connected" },
        },
        error: detail ? `Connection failed: ${detail}` : "Failed to initiate OAuth connection.",
      }));
    }
  },

  /**
   * Disconnects a platform by issuing DELETE /api/social/accounts/{id}.
   */
  disconnect: async (platform) => {
    const conn = get().connections[platform];
    const accountId = conn?.id || conn?.accountId;

    if (accountId) {
      try {
        await api.delete(`/social/accounts/${accountId}`);
      } catch (err) {
        console.error(`Failed to disconnect ${platform} on backend:`, err);
      }
    }

    set((s) => ({
      connections: {
        ...s.connections,
        [platform]: { platform, status: "not_connected" },
      },
    }));
  },

  /**
   * Reconnect initiates the same real OAuth authorization flow.
   */
  reconnect: async (platform) => {
    await get().connect(platform);
  },

  /**
   * Re-syncs by re-fetching real account status from the backend.
   */
  sync: async () => {
    await get().fetchAccounts();
  },
}));

export { SOCIAL_PLATFORMS };


