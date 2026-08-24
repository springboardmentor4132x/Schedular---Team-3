import { create } from "zustand";
import type { Campaign } from "@/types";

// Seeded so the Campaign Dashboard demos every status, platform, and
// progress state at once without needing to create anything first.
const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "camp_1",
    name: "Summer Launch Push",
    platform: "instagram",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    budget: 5000,
    objectives: "Drive awareness for the summer collection launch.",
    status: "active",
    scheduledPosts: 8,
    publishedPosts: 14,
  },
  {
    id: "camp_2",
    name: "Back to School",
    platform: "facebook",
    startDate: "2026-07-15",
    endDate: "2026-09-05",
    budget: 3200,
    objectives: "Promote back-to-school bundle offers to parents.",
    status: "active",
    scheduledPosts: 5,
    publishedPosts: 6,
  },
  {
    id: "camp_3",
    name: "Q1 Brand Awareness",
    platform: "linkedin",
    startDate: "2026-01-05",
    endDate: "2026-03-31",
    budget: 8000,
    objectives: "Build brand credibility among enterprise decision makers.",
    status: "completed",
    scheduledPosts: 0,
    publishedPosts: 22,
  },
  {
    id: "camp_4",
    name: "Holiday Teaser",
    platform: "twitter",
    startDate: "2026-11-10",
    endDate: "2026-12-24",
    budget: 4500,
    objectives: "Tease the holiday product line ahead of Black Friday.",
    status: "draft",
    scheduledPosts: 0,
    publishedPosts: 0,
  },
  {
    id: "camp_5",
    name: "Creator Collab Series",
    platform: "youtube",
    startDate: "2026-04-01",
    endDate: "2026-05-15",
    budget: 6000,
    objectives: "Partner with creators to widen top-of-funnel reach.",
    status: "paused",
    scheduledPosts: 2,
    publishedPosts: 9,
  },
  {
    id: "camp_6",
    name: "Product Pin Refresh",
    platform: "pinterest",
    startDate: "2026-02-01",
    endDate: "2026-02-28",
    budget: 1800,
    objectives: "Refresh product pins to lift click-through to the store.",
    status: "completed",
    scheduledPosts: 0,
    publishedPosts: 11,
  },
];

interface CampaignsState {
  campaigns: Campaign[];
  isLoading: boolean;
  hasLoaded: boolean;
  fetchCampaigns: () => void;
  deleteCampaign: (id: string) => void;
  addCampaign: (campaign: Omit<Campaign, "id" | "scheduledPosts" | "publishedPosts">) => Campaign;
  updateCampaign: (id: string, updates: Partial<Omit<Campaign, "id">>) => void;
  getCampaignById: (id: string) => Campaign | undefined;
}

export const useCampaignsStore = create<CampaignsState>((set, get) => ({
  campaigns: [],
  isLoading: false,
  hasLoaded: false,

  /**
   * TODO once the backend is live: replace this simulated round trip with a
   * real request, e.g. `const { data } = await api.get<Campaign[]>("/campaigns")`
   * (see lib/api.ts for the shared axios instance). Keep the isLoading /
   * hasLoaded flags so the Campaign Dashboard's loading state keeps working
   * unchanged.
   */
  fetchCampaigns: () => {
    if (get().isLoading || get().hasLoaded) return;

    set({ isLoading: true });

    setTimeout(() => {
      set({ campaigns: MOCK_CAMPAIGNS, isLoading: false, hasLoaded: true });
    }, 600);
  },

  /**
   * TODO once the backend is live: replace with `await api.delete(`/campaigns/${id}`)`
   * and only remove from state after a successful response (roll back /
   * surface an error toast on failure).
   */
  deleteCampaign: (id) => {
    set((s) => ({ campaigns: s.campaigns.filter((c) => c.id !== id) }));
  },

  /**
   * TODO once the backend is live: replace with `await api.post<Campaign>("/campaigns", input)`
   * and use the server-assigned id/timestamps instead of generating one
   * locally. Returns the created campaign so the form can redirect using its
   * real id.
   */
  addCampaign: (input) => {
    const campaign: Campaign = {
      ...input,
      id: `camp_${Date.now()}`,
      scheduledPosts: 0,
      publishedPosts: 0,
    };
    set((s) => ({ campaigns: [campaign, ...s.campaigns] }));
    return campaign;
  },

  /**
   * TODO once the backend is live: replace with `await api.patch<Campaign>(`/campaigns/${id}`, updates)`
   * and reconcile with the server response (roll back / surface an error
   * toast on failure) instead of updating local state directly.
   */
  updateCampaign: (id, updates) => {
    set((s) => ({
      campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  },

  /**
   * TODO once the backend is live: for a direct-link/refresh visit to a
   * Details or Edit page, this should fall back to `await api.get<Campaign>(`/campaigns/${id}`)`
   * when the campaign isn't already in local state (e.g. hasLoaded is still
   * false), instead of returning undefined.
   */
  getCampaignById: (id) => {
    return get().campaigns.find((c) => c.id === id);
  },
}));

export { CAMPAIGN_STATUS } from "@/lib/constants";