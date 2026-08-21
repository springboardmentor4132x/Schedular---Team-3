"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { RefreshCw } from "lucide-react";
import { useAnalyticsStore } from "@/store/useAnalyticsStore";
import { useCampaignsStore } from "@/store/useCampaignsStore";
import StatCard from "@/components/dashboard/StatCard";
import AnalyticsTabs from "./AnalyticsTabs";
import AnalyticsFilters from "./AnalyticsFilters";
import type { SocialPlatform } from "@/lib/constants";
import type { ContentType } from "@/types";
import type { DateRangeFilter, AudienceSnapshot } from "@/types/analytics";

// --- shared small helpers -------------------------------------------------

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function formatSignedNumber(n: number): string {
  const formatted = formatNumber(Math.abs(n));
  return n >= 0 ? `+${formatted}` : `-${formatted}`;
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

const PIE_COLORS = ["var(--ink)", "var(--info)", "var(--success)", "var(--accent-hover)", "var(--danger)", "var(--muted)"];

// Weighted merge across platforms (weighted by each platform's follower
// count) for when "All Platforms" is selected — keeps every distribution
// (age, gender, country, city, language, hourly/daily activity) meaningful
// as a single aggregate view instead of just picking one platform.
function mergeWeighted(
  snapshots: AudienceSnapshot[],
  getItems: (s: AudienceSnapshot) => { key: string; percentage: number }[]
): { key: string; percentage: number }[] {
  const totals = new Map<string, number>();
  let weightSum = 0;

  snapshots.forEach((snapshot) => {
    const weight = snapshot.followers;
    weightSum += weight;
    getItems(snapshot).forEach((item) => {
      totals.set(item.key, (totals.get(item.key) ?? 0) + item.percentage * weight);
    });
  });

  if (weightSum === 0) return [];
  return Array.from(totals.entries()).map(([key, value]) => ({
    key,
    percentage: Math.round(value / weightSum),
  }));
}

export default function AudienceAnalytics() {
  const { audienceSnapshots, isLoading, hasLoaded, fetchAnalytics } = useAnalyticsStore();
  const fetchCampaigns = useCampaignsStore((s) => s.fetchCampaigns);

  useEffect(() => {
    fetchAnalytics();
    fetchCampaigns();
  }, [fetchAnalytics, fetchCampaigns]);

  // Date/Campaign/Content Type are shown for visual consistency with the
  // other analytics pages, but audience snapshots are platform-level, not
  // post-level, so only the Platform filter actually affects this page.
  const [dateRange, setDateRange] = useState<DateRangeFilter>("30d");
  const [platform, setPlatform] = useState<SocialPlatform | "all">("all");
  const [campaignId, setCampaignId] = useState<string>("all");
  const [contentType, setContentType] = useState<ContentType | "all">("all");

  const relevantSnapshots = useMemo(
    () => (platform === "all" ? audienceSnapshots : audienceSnapshots.filter((s) => s.platform === platform)),
    [audienceSnapshots, platform]
  );

  const totals = useMemo(() => {
    return relevantSnapshots.reduce(
      (acc, s) => {
        acc.followers += s.followers;
        acc.newFollowers += s.newFollowers;
        acc.lostFollowers += s.lostFollowers;
        acc.netGrowth += s.followerGrowth;
        return acc;
      },
      { followers: 0, newFollowers: 0, lostFollowers: 0, netGrowth: 0 }
    );
  }, [relevantSnapshots]);

  const avgGrowthRate = useMemo(() => {
    if (relevantSnapshots.length === 0) return 0;
    return relevantSnapshots.reduce((sum, s) => sum + s.growthRate, 0) / relevantSnapshots.length;
  }, [relevantSnapshots]);

  // Followers Growth Graph: same backward-projection technique used on the
  // Main Dashboard's Followers Growth Trend — no historical series exists
  // in the mock store, so this derives a smooth curve from today's total
  // and the average growth rate. Frontend visualization only.
  const followersGrowthSeries = useMemo(() => {
    const days = 30;
    const growthFactor = 1 + avgGrowthRate / 100;
    const today = new Date();
    return Array.from({ length: days }, (_, i) => {
      const daysFromEnd = days - 1 - i;
      const date = new Date(today);
      date.setDate(date.getDate() - daysFromEnd);
      const value = Math.round(totals.followers / Math.pow(growthFactor || 1, daysFromEnd / days));
      return { date: date.toISOString().slice(0, 10), followers: value };
    });
  }, [totals.followers, avgGrowthRate]);

  const ageDistribution = useMemo(
    () => mergeWeighted(relevantSnapshots, (s) => s.demographics.map((d) => ({ key: d.ageRange, percentage: d.percentage }))),
    [relevantSnapshots]
  );

  const genderDistribution = useMemo(
    () => mergeWeighted(relevantSnapshots, (s) => s.genderDistribution.map((g) => ({ key: g.label, percentage: g.percentage }))),
    [relevantSnapshots]
  );

  const countryDistribution = useMemo(
    () =>
      mergeWeighted(relevantSnapshots, (s) => s.locations.map((l) => ({ key: l.country, percentage: l.percentage })))
        .sort((a, b) => b.percentage - a.percentage),
    [relevantSnapshots]
  );

  const cityDistribution = useMemo(
    () =>
      mergeWeighted(relevantSnapshots, (s) => s.cities.map((c) => ({ key: c.city, percentage: c.percentage })))
        .sort((a, b) => b.percentage - a.percentage),
    [relevantSnapshots]
  );

  const languageDistribution = useMemo(
    () =>
      mergeWeighted(relevantSnapshots, (s) => s.languages.map((l) => ({ key: l.language, percentage: l.percentage })))
        .sort((a, b) => b.percentage - a.percentage),
    [relevantSnapshots]
  );

  const activityByHour = useMemo(() => {
    const merged = mergeWeighted(relevantSnapshots, (s) => s.activityByHour.map((a) => ({ key: String(a.hour), percentage: a.level })));
    return merged
      .map((item) => ({ hour: Number(item.key), level: item.percentage }))
      .sort((a, b) => a.hour - b.hour);
  }, [relevantSnapshots]);

  const activityByDay = useMemo(() => {
    const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const merged = mergeWeighted(relevantSnapshots, (s) => s.activityByDay.map((a) => ({ key: a.day, percentage: a.level })));
    return merged
      .map((item) => ({ day: item.key, level: item.percentage }))
      .sort((a, b) => order.indexOf(a.day) - order.indexOf(b.day));
  }, [relevantSnapshots]);

  if (isLoading || !hasLoaded) {
    return (
      <div className="space-y-6">
        <AnalyticsTabs />
        <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border bg-surface p-16 text-center">
          <RefreshCw size={20} className="animate-spin text-muted" />
          <p className="text-sm text-muted">Loading audience analytics…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold">Audience Analytics</h1>
        <p className="mt-1 text-sm text-muted">Who your audience is, where they are, and when they're active.</p>
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
        <StatCard label="Total Followers" value={formatNumber(totals.followers)} />
        <StatCard label="New Followers" value={formatNumber(totals.newFollowers)} />
        <StatCard label="Lost Followers" value={formatNumber(totals.lostFollowers)} />
        <StatCard label="Net Growth" value={formatSignedNumber(totals.netGrowth)} />
      </div>

      <ChartCard title="Followers Growth Graph">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={followersGrowthSeries}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              tick={{ fontSize: 11, fill: "var(--muted)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={50} />
            <Tooltip
              labelFormatter={(label: React.ReactNode) =>
                new Date(String(label)).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              }
              contentStyle={CHART_TOOLTIP_STYLE}
            />
            <Line type="monotone" dataKey="followers" stroke="var(--ink)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Age Distribution (Demographics)">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Pie data={ageDistribution} dataKey="percentage" nameKey="key" innerRadius={45} outerRadius={80} paddingAngle={2}>
                {ageDistribution.map((entry, i) => (
                  <Cell key={entry.key} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
            {ageDistribution.map((entry, i) => (
              <span key={entry.key} className="flex items-center gap-1">
                <span className="h-2 w-2" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                {entry.key} ({entry.percentage}%)
              </span>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Gender Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Pie data={genderDistribution} dataKey="percentage" nameKey="key" innerRadius={45} outerRadius={80} paddingAngle={2}>
                {genderDistribution.map((entry, i) => (
                  <Cell key={entry.key} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
            {genderDistribution.map((entry, i) => (
              <span key={entry.key} className="flex items-center gap-1">
                <span className="h-2 w-2" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                {entry.key} ({entry.percentage}%)
              </span>
            ))}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Audience Location Graph (Country)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={countryDistribution} layout="vertical" margin={{ left: 16 }}>
            <CartesianGrid stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="key"
              width={100}
              tick={{ fontSize: 11, fill: "var(--muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Bar dataKey="percentage" fill="var(--info)" radius={[0, 2, 2, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="border border-border bg-surface p-5">
          <p className="font-mono text-xs text-muted">CITY</p>
          <div className="mt-3 space-y-2">
            {cityDistribution.map((entry) => (
              <div key={entry.key} className="flex items-center justify-between text-sm">
                <span className="text-ink">{entry.key}</span>
                <span className="font-mono text-xs text-muted">{entry.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-border bg-surface p-5">
          <p className="font-mono text-xs text-muted">LANGUAGES</p>
          <div className="mt-3 space-y-2">
            {languageDistribution.map((entry) => (
              <div key={entry.key} className="flex items-center justify-between text-sm">
                <span className="text-ink">{entry.key}</span>
                <span className="font-mono text-xs text-muted">{entry.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Most Active Hours">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityByHour}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="hour"
                tickFormatter={(h: number) => `${h}:00`}
                interval={3}
                tick={{ fontSize: 10, fill: "var(--muted)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip labelFormatter={(h: React.ReactNode) => `${h}:00`} contentStyle={CHART_TOOLTIP_STYLE} />
              <Bar dataKey="level" fill="var(--success)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Most Active Days">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityByDay}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Bar dataKey="level" fill="var(--accent-hover)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}