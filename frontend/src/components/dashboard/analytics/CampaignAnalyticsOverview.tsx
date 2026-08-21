"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, ChevronDown, TrendingUp, TrendingDown, X } from "lucide-react";
import { useCampaignsStore } from "@/store/useCampaignsStore";
import { usePostsStore } from "@/store/usePostsStore";
import { useAnalyticsStore } from "@/store/useAnalyticsStore";
import CampaignStatusBadge from "@/components/dashboard/campaigns/CampaignStatusBadge";
import AnalyticsTabs from "./AnalyticsTabs";
import { CAMPAIGN_STATUS } from "@/lib/constants";
import type { Campaign, CampaignStatus, Post } from "@/types";
import type { PostAnalytics } from "@/types/analytics";

type SortOption = "reach" | "engagement" | "roi" | "budget";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "reach", label: "Sort: Reach" },
  { value: "engagement", label: "Sort: Engagement Rate" },
  { value: "roi", label: "Sort: ROI" },
  { value: "budget", label: "Sort: Budget" },
];

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function campaignDurationDays(campaign: Campaign): number {
  const start = new Date(campaign.startDate).getTime();
  const end = new Date(campaign.endDate).getTime();
  return Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
}

interface CampaignPerformance {
  campaign: Campaign;
  postCount: number;
  reach: number;
  impressions: number;
  clicks: number;
  likes: number;
  totalEngagement: number;
  engagementRate: number;
  roi: number | null;
  hasRealData: boolean;
}

export default function CampaignAnalyticsOverview() {
  const campaigns = useCampaignsStore((s) => s.campaigns);
  const fetchCampaigns = useCampaignsStore((s) => s.fetchCampaigns);
  const posts = usePostsStore((s) => s.posts);
  const { postAnalytics, isLoading, hasLoaded, fetchAnalytics } = useAnalyticsStore();

  useEffect(() => {
    fetchCampaigns();
    fetchAnalytics();
  }, [fetchCampaigns, fetchAnalytics]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("reach");
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const postsByCampaign = useMemo(() => {
    const map = new Map<string, Post[]>();
    posts.forEach((post) => {
      if (!post.campaignId) return;
      const list = map.get(post.campaignId) ?? [];
      list.push(post);
      map.set(post.campaignId, list);
    });
    return map;
  }, [posts]);

  const analyticsByCampaign = useMemo(() => {
    const postToCampaign = new Map<string, string>();
    posts.forEach((post) => {
      if (post.campaignId) postToCampaign.set(post.id, post.campaignId);
    });

    const map = new Map<string, PostAnalytics[]>();
    postAnalytics.forEach((row) => {
      const campaignId = postToCampaign.get(row.postId);
      if (!campaignId) return;
      const list = map.get(campaignId) ?? [];
      list.push(row);
      map.set(campaignId, list);
    });
    return map;
  }, [postAnalytics, posts]);

  const performance: CampaignPerformance[] = useMemo(() => {
    return campaigns.map((campaign) => {
      const linkedPosts = postsByCampaign.get(campaign.id) ?? [];
      const rows = analyticsByCampaign.get(campaign.id) ?? [];

      if (rows.length > 0) {
        const totals = rows.reduce(
          (acc, row) => {
            acc.reach += row.reach;
            acc.impressions += row.impressions;
            acc.clicks += row.clicks;
            acc.likes += row.likes;
            acc.engagement += row.likes + row.comments + row.shares;
            return acc;
          },
          { reach: 0, impressions: 0, clicks: 0, likes: 0, engagement: 0 }
        );
        const engagementRate = totals.reach > 0 ? Number(((totals.engagement / totals.reach) * 100).toFixed(1)) : 0;

        return {
          campaign,
          postCount: linkedPosts.length,
          reach: totals.reach,
          impressions: totals.impressions,
          clicks: totals.clicks,
          likes: totals.likes,
          totalEngagement: totals.engagement,
          engagementRate,
          roi: campaign.metrics?.roi ?? null,
          hasRealData: true,
        };
      }

      const metrics = campaign.metrics;
      return {
        campaign,
        postCount: linkedPosts.length,
        reach: metrics?.reach ?? 0,
        impressions: metrics?.impressions ?? 0,
        clicks: metrics?.clicks ?? 0,
        likes: 0,
        totalEngagement: metrics?.engagement ?? 0,
        engagementRate: metrics ? Number(((metrics.engagement / Math.max(metrics.reach, 1)) * 100).toFixed(1)) : 0,
        roi: metrics?.roi ?? null,
        hasRealData: false,
      };
    });
  }, [campaigns, postsByCampaign, analyticsByCampaign]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return performance
      .filter((p) => {
        if (statusFilter !== "all" && p.campaign.status !== statusFilter) return false;
        if (query && !p.campaign.name.toLowerCase().includes(query)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "reach") return b.reach - a.reach;
        if (sortBy === "engagement") return b.engagementRate - a.engagementRate;
        if (sortBy === "roi") return (b.roi ?? -Infinity) - (a.roi ?? -Infinity);
        return b.campaign.budget - a.campaign.budget;
      });
  }, [performance, search, statusFilter, sortBy]);

  const rankable = useMemo(() => performance.filter((p) => p.reach > 0), [performance]);
  const topCampaigns = useMemo(
    () => [...rankable].sort((a, b) => b.engagementRate - a.engagementRate).slice(0, 3),
    [rankable]
  );
  const lowestCampaigns = useMemo(
    () => [...rankable].sort((a, b) => a.engagementRate - b.engagementRate).slice(0, 3),
    [rankable]
  );

  const compareCampaigns = useMemo(
    () => filtered.filter((p) => compareIds.includes(p.campaign.id)),
    [filtered, compareIds]
  );

  function toggleCompare(id: string) {
    setCompareIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  if (isLoading || !hasLoaded) {
    return (
      <div className="space-y-6">
        <AnalyticsTabs />
        <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border bg-surface p-16 text-center">
          <RefreshCw size={20} className="animate-spin text-muted" />
          <p className="text-sm text-muted">Loading campaign analytics…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold">Campaign Analytics</h1>
        <p className="mt-1 text-sm text-muted">Performance across every campaign, ranked and comparable.</p>
      </div>

      <AnalyticsTabs />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns…"
            className="w-full border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-accent-hover"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | "all")}
              className="appearance-none border border-border bg-surface py-2 pl-3 pr-8 text-sm capitalize outline-none focus:border-accent-hover">
              <option value="all">All Statuses</option>
              {CAMPAIGN_STATUS.map((status) => (
                <option key={status} value={status} className="capitalize">
                  {status}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none border border-border bg-surface py-2 pl-3 pr-8 text-sm outline-none focus:border-accent-hover">
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" />
          </div>
        </div>
      </div>

      {compareCampaigns.length > 0 ? (
        <div className="border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">Comparing {compareCampaigns.length} Campaigns</h2>
            <button
              onClick={() => setCompareIds([])}
              className="flex items-center gap-1 text-xs text-muted hover:text-ink">
              <X size={12} />
              Clear
            </button>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="py-2 pr-4 font-mono font-normal">CAMPAIGN</th>
                  <th className="py-2 pr-4 font-mono font-normal">POSTS</th>
                  <th className="py-2 pr-4 font-mono font-normal">REACH</th>
                  <th className="py-2 pr-4 font-mono font-normal">IMPRESSIONS</th>
                  <th className="py-2 pr-4 font-mono font-normal">CLICKS</th>
                  <th className="py-2 pr-4 font-mono font-normal">LIKES</th>
                  <th className="py-2 pr-4 font-mono font-normal">ENGAGEMENT</th>
                  <th className="py-2 font-mono font-normal">ROI</th>
                </tr>
              </thead>
              <tbody>
                {compareCampaigns.map((p) => (
                  <tr key={p.campaign.id} className="border-b border-border last:border-b-0">
                    <td className="max-w-[180px] truncate py-2 pr-4 font-medium">{p.campaign.name}</td>
                    <td className="py-2 pr-4">{p.postCount}</td>
                    <td className="py-2 pr-4">{formatNumber(p.reach)}</td>
                    <td className="py-2 pr-4">{formatNumber(p.impressions)}</td>
                    <td className="py-2 pr-4">{formatNumber(p.clicks)}</td>
                    <td className="py-2 pr-4">{formatNumber(p.likes)}</td>
                    <td className="py-2 pr-4 font-medium">{p.engagementRate}%</td>
                    <td className="py-2">{p.roi !== null ? `${p.roi}x` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="border border-border bg-surface p-5">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={15} className="text-success" />
            <h2 className="font-display text-base font-bold">Top Campaigns</h2>
          </div>
          {topCampaigns.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No campaigns with performance data yet.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {topCampaigns.map((p) => (
                <div key={p.campaign.id} className="border-t border-border pt-3 first:border-t-0 first:pt-0">
                  <p className="truncate text-sm font-medium text-ink">{p.campaign.name}</p>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted">
                    <CampaignStatusBadge status={p.campaign.status} />
                    <span className="font-mono">{p.engagementRate}% engagement</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-border bg-surface p-5">
          <div className="flex items-center gap-1.5">
            <TrendingDown size={15} className="text-danger" />
            <h2 className="font-display text-base font-bold">Lowest Performing Campaigns</h2>
          </div>
          {lowestCampaigns.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No campaigns with performance data yet.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {lowestCampaigns.map((p) => (
                <div key={p.campaign.id} className="border-t border-border pt-3 first:border-t-0 first:pt-0">
                  <p className="truncate text-sm font-medium text-ink">{p.campaign.name}</p>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted">
                    <CampaignStatusBadge status={p.campaign.status} />
                    <span className="font-mono">{p.engagementRate}% engagement</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border border-border bg-surface">
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No campaigns match the current filters.</p>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((p) => {
              const isComparing = compareIds.includes(p.campaign.id);
              return (
                <div key={p.campaign.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isComparing}
                        onChange={() => toggleCompare(p.campaign.id)}
                        className="mt-1 h-4 w-4 shrink-0 accent-[var(--ink)]"
                        aria-label={`Compare ${p.campaign.name}`}
                      />
                      <div>
                        <p className="text-sm font-medium text-ink">{p.campaign.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                          <CampaignStatusBadge status={p.campaign.status} />
                          <span>
                            {formatDate(p.campaign.startDate)} &ndash; {formatDate(p.campaign.endDate)} (
                            {campaignDurationDays(p.campaign)} days)
                          </span>
                          {!p.hasRealData ? <span className="italic">Estimated from campaign metrics</span> : null}
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-x-4 gap-y-2 text-xs sm:grid-cols-6">
                    <div>
                      <p className="text-muted">Posts</p>
                      <p className="font-medium text-ink">{p.postCount}</p>
                    </div>
                    <div>
                      <p className="text-muted">Reach</p>
                      <p className="font-medium text-ink">{formatNumber(p.reach)}</p>
                    </div>
                    <div>
                      <p className="text-muted">Impressions</p>
                      <p className="font-medium text-ink">{formatNumber(p.impressions)}</p>
                    </div>
                    <div>
                      <p className="text-muted">Clicks</p>
                      <p className="font-medium text-ink">{formatNumber(p.clicks)}</p>
                    </div>
                    <div>
                      <p className="text-muted">Likes</p>
                      <p className="font-medium text-ink">{formatNumber(p.likes)}</p>
                    </div>
                    <div>
                      <p className="text-muted">ROI</p>
                      <p className="font-medium text-ink">{p.roi !== null ? `${p.roi}x` : "—"}</p>
                    </div>
                  </div>

                  <div className="mt-2 grid w-fit grid-cols-2 gap-x-8 gap-y-2 text-xs">
                    <div>
                      <p className="text-muted">Total Engagement</p>
                      <p className="font-medium text-ink">{formatNumber(p.totalEngagement)}</p>
                    </div>
                    <div>
                      <p className="text-muted">Engagement Rate</p>
                      <p className="font-medium text-ink">{p.engagementRate}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}