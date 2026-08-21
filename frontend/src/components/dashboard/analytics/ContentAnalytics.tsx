"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, ChevronDown, ImageOff, X } from "lucide-react";
import { usePostsStore } from "@/store/usePostsStore";
import { useAnalyticsStore } from "@/store/useAnalyticsStore";
import { useCampaignsStore } from "@/store/useCampaignsStore";
import { PLATFORM_META } from "@/components/dashboard/accounts/platformMeta";
import { CONTENT_TYPES } from "@/lib/content";
import AnalyticsTabs from "./AnalyticsTabs";
import AnalyticsFilters from "./AnalyticsFilters";
import type { SocialPlatform } from "@/lib/constants";
import type { ContentType, Post } from "@/types";
import type { DateRangeFilter, PostAnalytics } from "@/types/analytics";

type SortOption = "engagement" | "reach";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "engagement", label: "Sort: Engagement" },
  { value: "reach", label: "Sort: Reach" },
];

function daysForRange(range: DateRangeFilter): number | null {
  if (range === "7d") return 7;
  if (range === "30d") return 30;
  if (range === "90d") return 90;
  if (range === "12m") return 365;
  return null;
}

function isWithinRange(dateStr: string | undefined, range: DateRangeFilter): boolean {
  if (!dateStr) return false;
  const days = daysForRange(range);
  if (days === null) return true;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return new Date(dateStr).getTime() >= cutoff;
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface ContentRow {
  analytics: PostAnalytics;
  post: Post;
  campaignName: string | null;
}

function PostThumbnail({ post }: { post: Post }) {
  const url = post.mediaUrls[0];
  const contentTypeMeta = CONTENT_TYPES.find((ct) => ct.value === post.contentType);
  const Icon = contentTypeMeta?.icon ?? ImageOff;

  if (url) {
    // eslint-disable-next-line @next/next/no-img-element -- mock/placeholder media URLs, not a Next-optimized asset set
    return <img src={url} alt="" className="h-12 w-12 shrink-0 border border-border object-cover" />;
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-border bg-background">
      <Icon size={18} className="text-muted" />
    </div>
  );
}

export default function ContentAnalytics() {
  const posts = usePostsStore((s) => s.posts);
  const { postAnalytics, isLoading, hasLoaded, fetchAnalytics } = useAnalyticsStore();
  const getCampaignById = useCampaignsStore((s) => s.getCampaignById);
  const fetchCampaigns = useCampaignsStore((s) => s.fetchCampaigns);

  useEffect(() => {
    fetchAnalytics();
    fetchCampaigns();
  }, [fetchAnalytics, fetchCampaigns]);

  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRangeFilter>("30d");
  const [platform, setPlatform] = useState<SocialPlatform | "all">("all");
  const [campaignId, setCampaignId] = useState<string>("all");
  const [contentType, setContentType] = useState<ContentType | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("engagement");
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const postsById = useMemo(() => {
    const map = new Map<string, Post>();
    posts.forEach((p) => map.set(p.id, p));
    return map;
  }, [posts]);

  const rows: ContentRow[] = useMemo(() => {
    const query = search.trim().toLowerCase();

    return postAnalytics
      .map((analytics) => {
        const post = postsById.get(analytics.postId);
        if (!post) return null;
        const campaign = post.campaignId ? getCampaignById(post.campaignId) : undefined;
        return { analytics, post, campaignName: campaign?.name ?? null };
      })
      .filter((row): row is ContentRow => {
        if (!row) return false;
        if (platform !== "all" && row.analytics.platform !== platform) return false;
        if (!isWithinRange(row.analytics.date, dateRange)) return false;
        if (campaignId !== "all" && row.post.campaignId !== campaignId) return false;
        if (contentType !== "all" && row.post.contentType !== contentType) return false;
        if (query && !row.post.caption.toLowerCase().includes(query)) return false;
        return true;
      })
      .sort((a, b) =>
        sortBy === "engagement"
          ? b.analytics.engagementRate - a.analytics.engagementRate
          : b.analytics.reach - a.analytics.reach
      );
  }, [postAnalytics, postsById, getCampaignById, search, platform, dateRange, campaignId, contentType, sortBy]);

  const compareRows = useMemo(
    () => rows.filter((r) => compareIds.includes(`${r.analytics.postId}-${r.analytics.platform}`)),
    [rows, compareIds]
  );

  function rowKey(row: ContentRow) {
    return `${row.analytics.postId}-${row.analytics.platform}`;
  }

  function toggleCompare(key: string) {
    setCompareIds((prev) => (prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key]));
  }

  if (isLoading || !hasLoaded) {
    return (
      <div className="space-y-6">
        <AnalyticsTabs />
        <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border bg-surface p-16 text-center">
          <RefreshCw size={20} className="animate-spin text-muted" />
          <p className="text-sm text-muted">Loading content analytics…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold">Content Analytics</h1>
        <p className="mt-1 text-sm text-muted">Performance for every published post, platform by platform.</p>
      </div>

      <AnalyticsTabs />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts…"
            className="w-full border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-accent-hover"
          />
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

      <AnalyticsFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        platform={platform}
        onPlatformChange={setPlatform}
        campaignId={campaignId}
        onCampaignChange={setCampaignId}
        contentType={contentType}
        onContentTypeChange={setContentType}
      />

      {compareRows.length > 0 ? (
        <div className="border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">Comparing {compareRows.length} Posts</h2>
            <button
              onClick={() => setCompareIds([])}
              className="flex items-center gap-1 text-xs text-muted hover:text-ink">
              <X size={12} />
              Clear
            </button>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="py-2 pr-4 font-mono font-normal">POST</th>
                  <th className="py-2 pr-4 font-mono font-normal">LIKES</th>
                  <th className="py-2 pr-4 font-mono font-normal">COMMENTS</th>
                  <th className="py-2 pr-4 font-mono font-normal">SHARES</th>
                  <th className="py-2 pr-4 font-mono font-normal">SAVES</th>
                  <th className="py-2 pr-4 font-mono font-normal">REACH</th>
                  <th className="py-2 pr-4 font-mono font-normal">IMPRESSIONS</th>
                  <th className="py-2 pr-4 font-mono font-normal">CLICKS</th>
                  <th className="py-2 font-mono font-normal">ENGAGEMENT</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row) => (
                  <tr key={rowKey(row)} className="border-b border-border last:border-b-0">
                    <td className="max-w-[180px] truncate py-2 pr-4 font-medium">{row.post.caption}</td>
                    <td className="py-2 pr-4">{formatNumber(row.analytics.likes)}</td>
                    <td className="py-2 pr-4">{formatNumber(row.analytics.comments)}</td>
                    <td className="py-2 pr-4">{formatNumber(row.analytics.shares)}</td>
                    <td className="py-2 pr-4">{formatNumber(row.analytics.saves)}</td>
                    <td className="py-2 pr-4">{formatNumber(row.analytics.reach)}</td>
                    <td className="py-2 pr-4">{formatNumber(row.analytics.impressions)}</td>
                    <td className="py-2 pr-4">{formatNumber(row.analytics.clicks)}</td>
                    <td className="py-2 font-medium">{row.analytics.engagementRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="border border-border bg-surface">
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No published posts match the current filters.</p>
        ) : (
          <div className="divide-y divide-border">
            {rows.map((row) => {
              const key = rowKey(row);
              const meta = PLATFORM_META[row.analytics.platform];
              const isComparing = compareIds.includes(key);
              return (
                <div key={key} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <label className="flex items-center gap-3 sm:flex-1">
                    <input
                      type="checkbox"
                      checked={isComparing}
                      onChange={() => toggleCompare(key)}
                      className="h-4 w-4 shrink-0 accent-[var(--ink)]"
                      aria-label={`Compare ${row.post.caption}`}
                    />
                    <PostThumbnail post={row.post} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{row.post.caption}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                        <span className="flex items-center gap-1" style={{ color: meta.color }}>
                          <meta.Icon size={12} />
                          {meta.label}
                        </span>
                        <span>{row.campaignName ?? "No campaign"}</span>
                        <span>{formatDate(row.analytics.date)}</span>
                        <span className="capitalize">{row.post.contentType}</span>
                      </div>
                    </div>
                  </label>

                  <div className="grid grid-cols-4 gap-x-4 gap-y-1 text-xs sm:grid-cols-8 sm:text-right">
                    <div>
                      <p className="text-muted">Likes</p>
                      <p className="font-medium text-ink">{formatNumber(row.analytics.likes)}</p>
                    </div>
                    <div>
                      <p className="text-muted">Comments</p>
                      <p className="font-medium text-ink">{formatNumber(row.analytics.comments)}</p>
                    </div>
                    <div>
                      <p className="text-muted">Shares</p>
                      <p className="font-medium text-ink">{formatNumber(row.analytics.shares)}</p>
                    </div>
                    <div>
                      <p className="text-muted">Saves</p>
                      <p className="font-medium text-ink">{formatNumber(row.analytics.saves)}</p>
                    </div>
                    <div>
                      <p className="text-muted">Reach</p>
                      <p className="font-medium text-ink">{formatNumber(row.analytics.reach)}</p>
                    </div>
                    <div>
                      <p className="text-muted">Impressions</p>
                      <p className="font-medium text-ink">{formatNumber(row.analytics.impressions)}</p>
                    </div>
                    <div>
                      <p className="text-muted">Clicks</p>
                      <p className="font-medium text-ink">{formatNumber(row.analytics.clicks)}</p>
                    </div>
                    <div>
                      <p className="text-muted">Engagement</p>
                      <p className="font-medium text-ink">{row.analytics.engagementRate}%</p>
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