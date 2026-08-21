import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types";
import type { Role } from "@/lib/validation";
import { ROLE_LABELS } from "@/lib/validation";
import { api } from "@/lib/api";

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  /**
   * Calls POST /api/auth/logout, clears auth state, and removes the stored JWT.
   */
  logout: () => Promise<void>;
  /**
   * Fetches current user profile from GET /api/auth/me.
   */
  fetchCurrentUser: () => Promise<User | null>;
  /**
   * Refreshes access token via POST /api/auth/refresh.
   */
  refreshToken: () => Promise<string | null>;
  /**
   * Dev-only convenience: builds a placeholder user for the given role so
   * every dashboard can be previewed before real login/JWT wiring exists.
   * Never called outside NODE_ENV === "development" — see RequireAuth.tsx.
   */
  setMockRole: (role: Role) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      setUser: (user) => set({ user }),

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch {
          // Ignore network or token errors during logout
        } finally {
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
          }
          set({ user: null });
        }
      },

      fetchCurrentUser: async () => {
        try {
          const res = await api.get<{
            id: number | string;
            name: string;
            email: string;
            phone?: string | null;
            organization?: string | null;
            designation?: string | null;
            bio?: string | null;
            role: string;
            is_active?: boolean;
            is_verified?: boolean;
            created_at?: string;
          }>("/auth/me");
          if (res.data) {
            const user: User = {
              id: String(res.data.id),
              name: res.data.name,
              email: res.data.email,
              role: res.data.role as User["role"],
              phone: res.data.phone ?? null,
              organization: res.data.organization ?? null,
              designation: res.data.designation ?? null,
              bio: res.data.bio ?? null,
              is_active: res.data.is_active,
              is_verified: res.data.is_verified,
              created_at: res.data.created_at,
            };
            set({ user });
            return user;
          }
        } catch {
          // Unauthenticated or network error
        }
        return null;
      },

      refreshToken: async () => {
        try {
          const res = await api.post<{
            access_token: string;
            token_type?: string;
            user_id?: number | string;
            name?: string;
            email?: string;
            role?: string;
          }>("/auth/refresh");
          const newToken = res.data?.access_token;
          const { user_id, name, email, role } = res.data ?? {};
          if (newToken && typeof window !== "undefined") {
            localStorage.setItem("token", newToken);
            if (user_id && name && email && role) {
              const updatedUser: User = {
                id: String(user_id),
                name,
                email,
                role: role as User["role"],
              };
              set((state) => ({
                user: state.user
                  ? {
                      ...state.user,
                      ...updatedUser,
                    }
                  : updatedUser,
              }));
            }
            return newToken;
          }
        } catch {
          // Token refresh failure
        }
        return null;
      },

      setMockRole: (role) =>
        set({
          user: {
            id: `mock-${role}`,
            name: `Preview ${ROLE_LABELS[role]}`,
            email: "preview@gmail.com",
            role,
          },
        }),
    }),
    {
      name: "socialpilot-auth",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : ({} as Storage)
      ),
      // Only persist the user object. The raw JWT lives under the separate
      // "token" key (read by the axios request interceptor) so there is a
      // single token source of truth and the persisted user is only the
      // decoded representation used by the UI.
      partialize: (state) => ({ user: state.user }),
    }
  )
);
