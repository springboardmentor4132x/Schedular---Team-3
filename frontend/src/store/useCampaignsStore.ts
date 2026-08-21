import { create } from "zustand";
import { api } from "@/lib/api";
import { extractErrorMessage } from "@/lib/reportsApi";
import type { Campaign, CampaignMetrics } from "@/types";
import { CAMPAIGN_STATUS } from "@/lib/constants";

// MODULE 4 - CAMPAIGN MANAGEMENT — backend integration
//
// Swagger only lists endpoint paths (no request/response schemas were
// captured), unlike Module 8 where Shamitha gave exact field names via a
// curl transcript. So this mapping is a best-effort guess, not a
// confirmed contract:
//   POST   /api/campaigns/                    Create Campaign
//   GET    /api/campaigns/                    Get Campaigns (list)
//   GET    /api/campaigns/{campaign_id}        Get Campaign
//   PUT    /api/campaigns/{campaign_id}        Update Campaign
//   DELETE /api/campaigns/{campaign_id}        Delete Campaign
//   PATCH  /api/campaigns/{campaign_id}/status  Update Campaign Status
//   GET    /api/campaigns/{campaign_id}/analytics
//   GET    /api/campaigns/{campaign_id}/posts
//   GET    /api/campaigns/analytics/overview
//   GET    /api/campaigns/stats/performance
//
// mapCampaignFromApi() below reads both snake_case (FastAPI's usual
// convention, matching Reports) and camelCase for every field, so this
// keeps working whichever the backend actually sends — but treat the
// exact field names as unverified until confirmed the same way Module 8's
// were (ideally with a real response body, like Shamitha's report id
// 10/11 examples). The backend's numeric id is stringified so the rest of
// the app (which treats Campaign.id as a string, e.g. "camp_4" before
// this change) keeps working unmodified.

function pick(record: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : value === undefined || value === null ? fallback : String(value);
}

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function mapMetricsFromApi(record: Record<string, unknown>): CampaignMetrics | undefined {
  const raw = pick(record, "metrics", "analytics");
  if (!raw || typeof raw !== "object") return undefined;
  const m = raw as Record<string, unknown>;
  return {
    engagement: asNumber(pick(m, "engagement")),
    reach: asNumber(pick(m, "reach")),
    impressions: asNumber(pick(m, "impressions")),
    clicks: asNumber(pick(m, "clicks")),
    roi: asNumber(pick(m, "roi")),
  };
}

function mapCampaignFromApi(raw: unknown): Campaign | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;

  const id = pick(record, "id", "campaign_id", "campaignId");
  if (id === undefined) return null;

  const status = asString(pick(record, "status"), "draft") as Campaign["status"];

  return {
    id: String(id),
    name: asString(pick(record, "name")),
    platform: asString(pick(record, "platform")),
    startDate: asString(pick(record, "start_date", "startDate")),
    endDate: asString(pick(record, "end_date", "endDate")),
    budget: asNumber(pick(record, "budget")),
    objectives: asString(pick(record, "objectives")),
    status: CAMPAIGN_STATUS.includes(status) ? status : "draft",
    scheduledPosts: asNumber(pick(record, "scheduled_posts", "scheduledPosts")),
    publishedPosts: asNumber(pick(record, "published_posts", "publishedPosts")),
    description: (pick(record, "description") as string | undefined) ?? undefined,
    category: (pick(record, "category") as Campaign["category"]) ?? undefined,
    priority: (pick(record, "priority") as Campaign["priority"]) ?? undefined,
    metrics: mapMetricsFromApi(record),
  };
}

function mapCampaignListFromApi(data: unknown): Campaign[] {
  // Tolerates either a bare array or a paginated { campaigns: [...] } /
  // { items: [...] } / { results: [...] } envelope — the Reports list
  // endpoint uses the former's cousin ({ reports: [...] }), so campaigns
  // may follow the same convention; unconfirmed either way.
  const list = Array.isArray(data)
    ? data
    : Array.isArray((data as Record<string, unknown>)?.campaigns)
      ? (data as Record<string, unknown>).campaigns
      : Array.isArray((data as Record<string, unknown>)?.items)
        ? (data as Record<string, unknown>).items
        : Array.isArray((data as Record<string, unknown>)?.results)
          ? (data as Record<string, unknown>).results
          : [];
  return (list as unknown[]).map(mapCampaignFromApi).filter((c): c is Campaign => c !== null);
}

/** Builds the request body for POST/PUT — camelCase form values -> backend snake_case. */
function buildCampaignPayload(input: Partial<Omit<Campaign, "id">>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name;
  if (input.platform !== undefined) payload.platform = input.platform;
  if (input.startDate !== undefined) payload.start_date = input.startDate;
  if (input.endDate !== undefined) payload.end_date = input.endDate;
  if (input.budget !== undefined) payload.budget = input.budget;
  if (input.objectives !== undefined) payload.objectives = input.objectives;
  if (input.status !== undefined) payload.status = input.status;
  if (input.description !== undefined) payload.description = input.description;
  if (input.category !== undefined) payload.category = input.category;
  if (input.priority !== undefined) payload.priority = input.priority;
  return payload;
}

interface CampaignsState {
  campaigns: Campaign[];
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  fetchCampaigns: () => void;
  deleteCampaign: (id: string) => Promise<void>;
  addCampaign: (campaign: Omit<Campaign, "id" | "scheduledPosts" | "publishedPosts">) => Promise<Campaign>;
  updateCampaign: (id: string, updates: Partial<Omit<Campaign, "id">>) => Promise<void>;
  getCampaignById: (id: string) => Campaign | undefined;
}

export const useCampaignsStore = create<CampaignsState>((set, get) => ({
  campaigns: [],
  isLoading: false,
  hasLoaded: false,
  error: null,

  fetchCampaigns: () => {
    if (get().isLoading || get().hasLoaded) return;
    set({ isLoading: true, error: null });

    api
      .get("/campaigns/")
      .then(({ data }) => {
        set({ campaigns: mapCampaignListFromApi(data), isLoading: false, hasLoaded: true });
      })
      .catch((error) => {
        set({ isLoading: false, hasLoaded: true, error: extractErrorMessage(error, "Couldn't load campaigns.") });
      });
  },

  deleteCampaign: async (id) => {
    const previous = get().campaigns;
    // Optimistic remove, rolled back on failure (same pattern as the
    // Reports store's removeReport).
    set({ campaigns: previous.filter((c) => c.id !== id) });
    try {
      await api.delete(`/campaigns/${id}`);
    } catch (error) {
      set({ campaigns: previous, error: extractErrorMessage(error, "Couldn't delete that campaign.") });
    }
  },

  addCampaign: async (input) => {
    const { data } = await api.post("/campaigns/", buildCampaignPayload(input));
    const created = mapCampaignFromApi(data) ?? {
      ...input,
      id: `camp_${Date.now()}`,
      scheduledPosts: 0,
      publishedPosts: 0,
    };
    set((s) => ({ campaigns: [created, ...s.campaigns] }));
    return created;
  },

  updateCampaign: async (id, updates) => {
    const { data } = await api.put(`/campaigns/${id}`, buildCampaignPayload(updates));
    const updated = mapCampaignFromApi(data);
    set((s) => ({
      campaigns: s.campaigns.map((c) => (c.id === id ? (updated ?? { ...c, ...updates }) : c)),
    }));
  },

  /**
   * Reads from whatever's already in local state — only populated once
   * fetchCampaigns() has resolved. A fresh page load straight to a detail
   * or edit route still works because those pages call fetchCampaigns()
   * themselves on mount (see CampaignEditView.tsx / CampaignDetails.tsx).
   */
  getCampaignById: (id) => {
    return get().campaigns.find((c) => c.id === id);
  },
}));

export { CAMPAIGN_STATUS } from "@/lib/constants";
