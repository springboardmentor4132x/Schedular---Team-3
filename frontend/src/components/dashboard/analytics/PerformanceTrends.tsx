"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, RefreshCw } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useAnalyticsStore } from "@/store/useAnalyticsStore";
import StatCard from "@/components/dashboard/StatCard";
import AnalyticsTabs from "./AnalyticsTabs";
import AnalyticsFilters from "./AnalyticsFilters";
import type { SocialPlatform } from "@/lib/constants";
import type { ContentType } from "@/types";
import type { DateRangeFilter, TrendGranularity, TrendPoint } from "@/types/analytics";

// MODULE 6 PART 8A — PERFORMANCE TRENDS (FOUNDATION)
// Data layer + filters + granularity bucketing only. No charts yet — those
// land in Part 8B. Reuses useAnalyticsStore's existing trendPoints/
// audienceSnapshots as-is (no store changes) and the existing
// AnalyticsTabs/AnalyticsFilters components unchanged.

// MODULE 6 PART 8B — PERFORMANCE TRENDS CHARTS
// Adds the 5 Recharts (Engagement/Reach/Impressions/Clicks/Followers
// Growth) on top of 8A's bucketedRows — the exact same rows the table
// below already renders, so the charts and the table can never disagree.
// Nothing above this comment block, and none of 8A's helpers/state, is
// changed.

// --- date range helpers (same technique as AnalyticsDashboard.tsx) -------

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

function formatSignedNumber(n: number): string {
  const formatted = formatNumber(Math.abs(n));
  return n >= 0 ? `+${formatted}` : `-${formatted}`;
}

function formatShortDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// --- granularity bucketing -------------------------------------------

const GRANULARITY_OPTIONS: { value: TrendGranularity; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

interface TrendBucketRow {
  key: string;
  label: string;
  sortKey: string;
  engagement: number;
  reach: number;
  impressions: number;
  clicks: number;
  followerGrowth: number;
}

// Monday-start week, so "weekly" buckets line up the same way regardless of
// which day of the week the range happens to start/end on.
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function bucketKeyFor(dateStr: string, granularity: TrendGranularity): { key: string; label: string; sortKey: string } {
  const date = new Date(`${dateStr}T00:00:00`);

  if (granularity === "daily") {
    return { key: dateStr, label: formatShortDate(dateStr), sortKey: dateStr };
  }

  if (granularity === "weekly") {
    const weekStart = getWeekStart(date);
    const key = weekStart.toISOString().slice(0, 10);
    return { key, label: `Week of ${formatShortDate(key)}`, sortKey: key };
  }

  if (granularity === "monthly") {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    return { key, label, sortKey: `${key}-01` };
  }

  if (granularity === "quarterly") {
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    const key = `${date.getFullYear()}-Q${quarter}`;
    const sortMonth = String((quarter - 1) * 3 + 1).padStart(2, "0");
    return { key, label: key, sortKey: `${date.getFullYear()}-${sortMonth}-01` };
  }

  // yearly
  const key = String(date.getFullYear());
  return { key, label: key, sortKey: `${key}-01-01` };
}

// Sums engagement/reach/impressions/clicks per bucket (flow metrics — sum
// is the right aggregate), and sums the day-over-day follower deltas per
// bucket (net follower growth over that period). Both inputs share the
// same date axis (filteredTrend), so they're merged by date.
function bucketTrendData(
  points: TrendPoint[],
  followerDeltaByDate: Map<string, number>,
  granularity: TrendGranularity
): TrendBucketRow[] {
  const buckets = new Map<string, TrendBucketRow>();

  points.forEach((point) => {
    const { key, label, sortKey } = bucketKeyFor(point.date, granularity);
    const existing =
      buckets.get(key) ?? { key, label, sortKey, engagement: 0, reach: 0, impressions: 0, clicks: 0, followerGrowth: 0 };

    existing.engagement += point.engagement;
    existing.reach += point.reach;
    existing.impressions += point.impressions;
    existing.clicks += point.clicks;
    existing.followerGrowth += followerDeltaByDate.get(point.date) ?? 0;

    buckets.set(key, existing);
  });

  return Array.from(buckets.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

// --- small local UI helper (same visual pattern as AnalyticsFilters'
// FilterSelect, kept local since granularity isn't part of that shared
// component's filter set) -------------------------------------------

function GranularitySelect({
  value,
  onChange,
}: {
  value: TrendGranularity;
  onChange: (value: TrendGranularity) => void;
}) {
  return (
    <div className="relative">
      <label className="sr-only">Granularity</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TrendGranularity)}
        aria-label="Granularity"
        className="appearance-none border border-border bg-surface py-2 pl-3 pr-8 text-sm outline-none focus:border-accent-hover">
        {GRANULARITY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" />
    </div>
  );
}

// --- Part 8B: chart helpers -------------------------------------------
// Same ChartCard / tooltip-style / tooltip-formatter conventions used by
// AnalyticsDashboard.tsx and PlatformComparison.tsx elsewhere in Module 6,
// so these 5 charts look identical to the ones on the other Analytics tabs.

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

// recharts' Tooltip formatter value type is a union (number | string |
// readonly (number | string)[] | undefined) — this bridges that and lets
// each chart supply its own metric label without repeating the cast,
// matching PlatformComparison.tsx's formatTooltipValue.
function makeTooltipFormatter(
  label: string,
  signed = false
): (value: number | string | readonly (number | string)[] | undefined) => [string, string] {
  return (value) => {
    if (value === undefined) return ["—", label];
    const num = Array.isArray(value) ? Number(value[0]) : Number(value);
    return [signed ? formatSignedNumber(num) : formatNumber(num), label];
  };
}

function TrendLineChart({
  data,
  dataKey,
  color,
  tooltipLabel,
  signed = false,
}: {
  data: TrendBucketRow[];
  dataKey: keyof TrendBucketRow;
  color: string;
  tooltipLabel: string;
  signed?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "var(--muted)" }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={24}
        />
        <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={48} />
        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={makeTooltipFormatter(tooltipLabel, signed)} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={data.length <= 20} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function PerformanceTrends() {
  const { trendPoints, audienceSnapshots, isLoading, hasLoaded, fetchAnalytics } = useAnalyticsStore();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const [dateRange, setDateRange] = useState<DateRangeFilter>("30d");
  const [platform, setPlatform] = useState<SocialPlatform | "all">("all");
  const [campaignId, setCampaignId] = useState<string>("all");
  const [contentType, setContentType] = useState<ContentType | "all">("all");
  const [granularity, setGranularity] = useState<TrendGranularity>("daily");

  // Engagement/Reach/Impressions/Clicks come from trendPoints, which is a
  // single day-level series with no platform/campaign/content-type
  // dimension (same as AnalyticsDashboard's "Overall Engagement Trend" and
  // friends) — Date Range is the only filter that changes these values.
  // Platform/Campaign/Content Type are still shown, for consistency with
  // every other analytics page, but only Followers Growth below responds
  // to Platform (audience data is platform-level, same limitation already
  // documented in AudienceAnalytics.tsx).
  const filteredTrend = useMemo(
    () => trendPoints.filter((p) => isWithinRange(p.date, dateRange)),
    [trendPoints, dateRange]
  );

  const relevantSnapshots = useMemo(
    () => (platform === "all" ? audienceSnapshots : audienceSnapshots.filter((s) => s.platform === platform)),
    [audienceSnapshots, platform]
  );

  const totalFollowers = useMemo(
    () => relevantSnapshots.reduce((sum, s) => sum + s.followers, 0),
    [relevantSnapshots]
  );

  const avgGrowthRate = useMemo(() => {
    if (relevantSnapshots.length === 0) return 0;
    return relevantSnapshots.reduce((sum, s) => sum + s.growthRate, 0) / relevantSnapshots.length;
  }, [relevantSnapshots]);

  // Followers Growth: no historical follower series exists in the mock
  // store (AudienceSnapshot is a single current snapshot), so — same
  // backward-projection technique already used on the Main Dashboard and
  // Audience Analytics — this derives a smooth daily curve from today's
  // totalFollowers and avgGrowthRate along the same date axis as
  // filteredTrend, then turns it into day-over-day deltas so it can be
  // summed per bucket below. Frontend visualization aid only.
  const followerDeltaByDate = useMemo(() => {
    const n = filteredTrend.length || 1;
    const growthFactor = 1 + avgGrowthRate / 100;
    const dailyFollowers = filteredTrend.map((point, i) => {
      const daysFromEnd = n - 1 - i;
      const value = Math.round(totalFollowers / Math.pow(growthFactor || 1, daysFromEnd / n));
      return { date: point.date, followers: value };
    });

    const deltas = new Map<string, number>();
    dailyFollowers.forEach((point, i) => {
      const previous = i === 0 ? point.followers : dailyFollowers[i - 1].followers;
      deltas.set(point.date, point.followers - previous);
    });
    return deltas;
  }, [filteredTrend, totalFollowers, avgGrowthRate]);

  const bucketedRows = useMemo(
    () => bucketTrendData(filteredTrend, followerDeltaByDate, granularity),
    [filteredTrend, followerDeltaByDate, granularity]
  );

  const totals = useMemo(() => {
    return bucketedRows.reduce(
      (acc, row) => {
        acc.engagement += row.engagement;
        acc.reach += row.reach;
        acc.impressions += row.impressions;
        acc.clicks += row.clicks;
        acc.followerGrowth += row.followerGrowth;
        return acc;
      },
      { engagement: 0, reach: 0, impressions: 0, clicks: 0, followerGrowth: 0 }
    );
  }, [bucketedRows]);

  if (isLoading || !hasLoaded) {
    return (
      <div className="space-y-6">
        <AnalyticsTabs />
        <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border bg-surface p-16 text-center">
          <RefreshCw size={20} className="animate-spin text-muted" />
          <p className="text-sm text-muted">Loading performance trends…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold">Performance Trends</h1>
        <p className="mt-1 text-sm text-muted">
          Engagement, reach, impressions, clicks, and followers growth over time — bucketed by the period you pick.
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

      <div className="flex items-center justify-end">
        <GranularitySelect value={granularity} onChange={setGranularity} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Engagement" value={formatNumber(totals.engagement)} />
        <StatCard label="Total Reach" value={formatNumber(totals.reach)} />
        <StatCard label="Total Impressions" value={formatNumber(totals.impressions)} />
        <StatCard label="Total Clicks" value={formatNumber(totals.clicks)} />
        <StatCard label="Net Followers Growth" value={formatSignedNumber(totals.followerGrowth)} />
      </div>

      {/* PART 8B: the 5 required Recharts, built directly off bucketedRows —
          the same rows the table below renders, so switching Granularity
          or any filter updates the charts and the table together. */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Engagement Trend">
          <TrendLineChart data={bucketedRows} dataKey="engagement" color="var(--ink)" tooltipLabel="Engagement" />
        </ChartCard>

        <ChartCard title="Reach Trend">
          <TrendLineChart data={bucketedRows} dataKey="reach" color="var(--info)" tooltipLabel="Reach" />
        </ChartCard>

        <ChartCard title="Impressions Trend">
          <TrendLineChart
            data={bucketedRows}
            dataKey="impressions"
            color="var(--success)"
            tooltipLabel="Impressions"
          />
        </ChartCard>

        <ChartCard title="Clicks Trend">
          <TrendLineChart data={bucketedRows} dataKey="clicks" color="var(--danger)" tooltipLabel="Clicks" />
        </ChartCard>

        <div className="lg:col-span-2">
          <ChartCard title="Followers Growth Trend">
            <TrendLineChart
              data={bucketedRows}
              dataKey="followerGrowth"
              color="var(--accent-hover)"
              tooltipLabel="Followers Growth"
              signed
            />
          </ChartCard>
        </div>
      </div>

      <div className="overflow-x-auto border border-border bg-surface">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted">
              <th className="py-3 pl-4 pr-4 font-mono font-normal">
                {GRANULARITY_OPTIONS.find((o) => o.value === granularity)?.label.toUpperCase()} PERIOD
              </th>
              <th className="py-3 pr-4 text-right font-mono font-normal">ENGAGEMENT</th>
              <th className="py-3 pr-4 text-right font-mono font-normal">REACH</th>
              <th className="py-3 pr-4 text-right font-mono font-normal">IMPRESSIONS</th>
              <th className="py-3 pr-4 text-right font-mono font-normal">CLICKS</th>
              <th className="py-3 pr-4 text-right font-mono font-normal">FOLLOWERS GROWTH</th>
            </tr>
          </thead>
          <tbody>
            {bucketedRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-muted">
                  No trend data for the current filters.
                </td>
              </tr>
            ) : (
              bucketedRows.map((row) => (
                <tr key={row.key} className="border-b border-border last:border-b-0">
                  <td className="py-3 pl-4 pr-4 font-medium text-ink">{row.label}</td>
                  <td className="py-3 pr-4 text-right text-ink">{formatNumber(row.engagement)}</td>
                  <td className="py-3 pr-4 text-right text-ink">{formatNumber(row.reach)}</td>
                  <td className="py-3 pr-4 text-right text-ink">{formatNumber(row.impressions)}</td>
                  <td className="py-3 pr-4 text-right text-ink">{formatNumber(row.clicks)}</td>
                  <td
                    className="py-3 pr-4 text-right font-medium"
                    style={{ color: row.followerGrowth >= 0 ? "var(--success)" : "var(--danger)" }}>
                    {formatSignedNumber(row.followerGrowth)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}