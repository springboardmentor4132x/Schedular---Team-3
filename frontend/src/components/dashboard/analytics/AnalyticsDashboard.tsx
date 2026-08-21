"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { RefreshCw } from "lucide-react";
import { usePostsStore } from "@/store/usePostsStore";
import { useAnalyticsStore } from "@/store/useAnalyticsStore";
import StatCard from "@/components/dashboard/StatCard";
import AnalyticsTabs from "./AnalyticsTabs";
import AnalyticsFilters from "./AnalyticsFilters";
import type { SocialPlatform } from "@/lib/constants";
import type { ContentType, Post } from "@/types";
import type { DateRangeFilter } from "@/types/analytics";

// --- date range helpers -------------------------------------------------

function daysForRange(range: DateRangeFilter): number | null {
  if (range === "7d") return 7;
  if (range === "30d") return 30;
  if (range === "90d") return 90;
  if (range === "12m") return 365;
  return null; // "all"
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

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// recharts' Tooltip labelFormatter prop expects (label: ReactNode, ...) => ReactNode,
// which formatShortDate's (iso: string) => string signature isn't assignable to —
// this wrapper bridges the two without changing formatShortDate itself.
function formatTooltipLabel(label: React.ReactNode): string {
  return formatShortDate(String(label));
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border bg-surface p-5">
      <p className="font-mono text-xs text-muted">{title.toUpperCase()}</p>
      <div className="mt-3 h-56">{children}</div>
    </div>
  );
}

const CHART_TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: 0,
  border: "1px solid var(--border)",
  backgroundColor: "var(--surface)",
};

export default function AnalyticsDashboard() {
  const posts = usePostsStore((s) => s.posts);
  const { postAnalytics, audienceSnapshots, trendPoints, isLoading, hasLoaded, fetchAnalytics } =
    useAnalyticsStore();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const [dateRange, setDateRange] = useState<DateRangeFilter>("30d");
  const [platform, setPlatform] = useState<SocialPlatform | "all">("all");
  const [campaignId, setCampaignId] = useState<string>("all");
  const [contentType, setContentType] = useState<ContentType | "all">("all");

  const postsById = useMemo(() => {
    const map = new Map<string, Post>();
    posts.forEach((p) => map.set(p.id, p));
    return map;
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (platform !== "all" && !post.platforms.includes(platform)) return false;
      if (campaignId !== "all" && post.campaignId !== campaignId) return false;
      if (contentType !== "all" && post.contentType !== contentType) return false;
      return true;
    });
  }, [posts, platform, campaignId, contentType]);

  const publishedPosts = useMemo(
    () => filteredPosts.filter((p) => p.status === "published" && isWithinRange(p.updatedAt, dateRange)),
    [filteredPosts, dateRange]
  );

  const scheduledPosts = useMemo(
    () => filteredPosts.filter((p) => p.status === "scheduled" && isWithinRange(p.scheduledDate, dateRange)),
    [filteredPosts, dateRange]
  );

  const filteredAnalytics = useMemo(() => {
    return postAnalytics.filter((row) => {
      if (platform !== "all" && row.platform !== platform) return false;
      if (!isWithinRange(row.date, dateRange)) return false;
      const post = postsById.get(row.postId);
      if (campaignId !== "all" && post?.campaignId !== campaignId) return false;
      if (contentType !== "all" && post?.contentType !== contentType) return false;
      return true;
    });
  }, [postAnalytics, platform, dateRange, campaignId, contentType, postsById]);

  const totals = useMemo(() => {
    return filteredAnalytics.reduce(
      (acc, row) => {
        acc.impressions += row.impressions;
        acc.reach += row.reach;
        acc.likes += row.likes;
        acc.comments += row.comments;
        acc.shares += row.shares;
        acc.clicks += row.clicks;
        return acc;
      },
      { impressions: 0, reach: 0, likes: 0, comments: 0, shares: 0, clicks: 0 }
    );
  }, [filteredAnalytics]);

  const totalEngagement = totals.likes + totals.comments + totals.shares;
  const engagementRate = totals.reach > 0 ? Number(((totalEngagement / totals.reach) * 100).toFixed(1)) : 0;

  const relevantSnapshots = useMemo(
    () => (platform === "all" ? audienceSnapshots : audienceSnapshots.filter((a) => a.platform === platform)),
    [audienceSnapshots, platform]
  );
  const totalFollowers = relevantSnapshots.reduce((sum, a) => sum + a.followers, 0);
  const avgGrowthRate =
    relevantSnapshots.length > 0
      ? relevantSnapshots.reduce((sum, a) => sum + a.growthRate, 0) / relevantSnapshots.length
      : 0;

  const filteredTrend = useMemo(
    () => trendPoints.filter((p) => isWithinRange(p.date, dateRange)),
    [trendPoints, dateRange]
  );

  // Followers Growth Trend: no historical follower series exists in the
  // mock store (AudienceSnapshot is a single current snapshot), so this
  // derives a smooth backward projection from today's totalFollowers and
  // avgGrowthRate, using the same date axis as the other trend charts.
  // Purely a frontend visualization aid — not new store state.
  const followersTrend = useMemo(() => {
    const n = filteredTrend.length || 1;
    const growthFactor = 1 + avgGrowthRate / 100;
    return filteredTrend.map((point, i) => {
      const daysFromEnd = n - 1 - i;
      const value = Math.round(totalFollowers / Math.pow(growthFactor || 1, daysFromEnd / n));
      return { date: point.date, followers: value };
    });
  }, [filteredTrend, totalFollowers, avgGrowthRate]);

  // Publishing Activity Timeline: real post counts per day, from
  // usePostsStore (read-only) — not mock-generated.
  const publishingActivity = useMemo(() => {
    const counts = new Map<string, number>();
    filteredPosts.forEach((p) => {
      if (!isWithinRange(p.scheduledDate, dateRange)) return;
      counts.set(p.scheduledDate, (counts.get(p.scheduledDate) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredPosts, dateRange]);

  if (isLoading || !hasLoaded) {
    return (
      <div className="space-y-6">
        <AnalyticsTabs />
        <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border bg-surface p-16 text-center">
          <RefreshCw size={20} className="animate-spin text-muted" />
          <p className="text-sm text-muted">Loading analytics…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold">Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Engagement, reach, and publishing performance across every connected platform.
        </p>
      </div>

      <AnalyticsTabs />

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Published Posts" value={publishedPosts.length} />
        <StatCard label="Total Scheduled Posts" value={scheduledPosts.length} />
        <StatCard label="Total Impressions" value={formatNumber(totals.impressions)} />
        <StatCard label="Total Reach" value={formatNumber(totals.reach)} />
        <StatCard label="Total Engagement" value={formatNumber(totalEngagement)} />
        <StatCard label="Total Likes" value={formatNumber(totals.likes)} />
        <StatCard label="Total Comments" value={formatNumber(totals.comments)} />
        <StatCard label="Total Shares" value={formatNumber(totals.shares)} />
        <StatCard label="Total Clicks" value={formatNumber(totals.clicks)} />
        <StatCard label="Total Followers" value={formatNumber(totalFollowers)} />
        <StatCard label="Overall Engagement Rate" value={`${engagementRate}%`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Overall Engagement Trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredTrend}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip labelFormatter={formatTooltipLabel} contentStyle={CHART_TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="engagement" stroke="var(--ink)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Reach Trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredTrend}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip labelFormatter={formatTooltipLabel} contentStyle={CHART_TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="reach" stroke="var(--info)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Impressions Trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredTrend}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip labelFormatter={formatTooltipLabel} contentStyle={CHART_TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="impressions" stroke="var(--success)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Followers Growth Trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={followersTrend}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip labelFormatter={formatTooltipLabel} contentStyle={CHART_TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="followers" stroke="var(--accent-hover)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="lg:col-span-2">
          <ChartCard title="Publishing Activity Timeline">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={publishingActivity}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  tick={{ fontSize: 11, fill: "var(--muted)" }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "var(--muted)" }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip labelFormatter={formatTooltipLabel} contentStyle={CHART_TOOLTIP_STYLE} />
                <Bar dataKey="count" fill="var(--ink)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}