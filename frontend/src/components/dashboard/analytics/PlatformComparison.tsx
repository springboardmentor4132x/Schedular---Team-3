"use client";

import { useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { RefreshCw } from "lucide-react";
import { useAnalyticsStore } from "@/store/useAnalyticsStore";
import { PLATFORM_META } from "@/components/dashboard/accounts/platformMeta";
import AnalyticsTabs from "./AnalyticsTabs";
import { SOCIAL_PLATFORMS } from "@/lib/constants";
import type { PlatformComparisonMetrics } from "@/types/analytics";

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

// recharts' Tooltip labelFormatter prop expects (label: ReactNode, ...) =>
// ReactNode, which a (p: string) => string signature isn't assignable to.
function formatTooltipLabel(label: React.ReactNode): string {
  const key = String(label) as keyof typeof PLATFORM_META;
  return PLATFORM_META[key]?.label ?? String(label);
}

// recharts' Tooltip formatter prop's value type is a union (number | string
// | readonly (number | string)[] | undefined) — this bridges that and lets
// each chart supply its own metric label/suffix without repeating the cast.
function formatTooltipValue(
  label: string,
  suffix = ""
): (value: number | string | readonly (number | string)[] | undefined) => [string, string] {
  return (value) => {
    if (value === undefined) return ["—", label];
    const num = Array.isArray(value) ? Number(value[0]) : Number(value);
    return [suffix ? `${num}${suffix}` : formatNumber(num), label];
  };
}

const METRIC_COLUMNS: { key: keyof Omit<PlatformComparisonMetrics, "platform">; label: string }[] = [
  { key: "followers", label: "Followers" },
  { key: "reach", label: "Reach" },
  { key: "impressions", label: "Impressions" },
  { key: "engagement", label: "Engagement" },
  { key: "likes", label: "Likes" },
  { key: "comments", label: "Comments" },
  { key: "shares", label: "Shares" },
  { key: "clicks", label: "Clicks" },
];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border bg-surface p-5">
      <p className="font-mono text-xs text-muted">{title.toUpperCase()}</p>
      <div className="mt-3 h-64">{children}</div>
    </div>
  );
}

const CHART_TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: 0,
  border: "1px solid var(--border)",
  backgroundColor: "var(--surface)",
};

export default function PlatformComparison() {
  const { platformComparison, audienceSnapshots, isLoading, hasLoaded, fetchAnalytics } = useAnalyticsStore();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading || !hasLoaded) {
    return (
      <div className="space-y-6">
        <AnalyticsTabs />
        <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border bg-surface p-16 text-center">
          <RefreshCw size={20} className="animate-spin text-muted" />
          <p className="text-sm text-muted">Loading platform comparison…</p>
        </div>
      </div>
    );
  }

  // Rendered in the fixed SOCIAL_PLATFORMS order (matches PLATFORM_META and
  // every other platform-ordered list in the project), not the order the
  // store happened to generate them in.
  const rows = SOCIAL_PLATFORMS.map((platform) =>
    platformComparison.find((p) => p.platform === platform)
  ).filter((row): row is PlatformComparisonMetrics => Boolean(row));

  // Growth rate lives on AudienceSnapshot (Part 5), not on
  // PlatformComparisonMetrics — reused read-only from the same store rather
  // than duplicating the field.
  const growthRows = SOCIAL_PLATFORMS.map((platform) => {
    const snapshot = audienceSnapshots.find((s) => s.platform === platform);
    return snapshot ? { platform, growthRate: snapshot.growthRate } : null;
  }).filter((row): row is { platform: (typeof SOCIAL_PLATFORMS)[number]; growthRate: number } => Boolean(row));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold">Platform Comparison</h1>
        <p className="mt-1 text-sm text-muted">
          Followers, reach, and engagement side by side across every connected platform.
        </p>
      </div>

      <AnalyticsTabs />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Platform-wise Engagement">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ left: 0, right: 8 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="platform"
                tickFormatter={(p: string) => PLATFORM_META[p as keyof typeof PLATFORM_META].label}
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={50} />
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                labelFormatter={formatTooltipLabel}
                formatter={formatTooltipValue("Engagement")}
              />
              <Bar dataKey="engagement" radius={[2, 2, 0, 0]}>
                {rows.map((row) => (
                  <Cell key={row.platform} fill={PLATFORM_META[row.platform].color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Platform-wise Reach">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ left: 0, right: 8 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="platform"
                tickFormatter={(p: string) => PLATFORM_META[p as keyof typeof PLATFORM_META].label}
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={50} />
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                labelFormatter={formatTooltipLabel}
                formatter={formatTooltipValue("Reach")}
              />
              <Bar dataKey="reach" radius={[2, 2, 0, 0]}>
                {rows.map((row) => (
                  <Cell key={row.platform} fill={PLATFORM_META[row.platform].color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Platform-wise Followers">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ left: 0, right: 8 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="platform"
                tickFormatter={(p: string) => PLATFORM_META[p as keyof typeof PLATFORM_META].label}
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={50} />
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                labelFormatter={formatTooltipLabel}
                formatter={formatTooltipValue("Followers")}
              />
              <Bar dataKey="followers" radius={[2, 2, 0, 0]}>
                {rows.map((row) => (
                  <Cell key={row.platform} fill={PLATFORM_META[row.platform].color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Platform-wise Growth">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={growthRows} margin={{ left: 0, right: 8 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="platform"
                tickFormatter={(p: string) => PLATFORM_META[p as keyof typeof PLATFORM_META].label}
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                unit="%"
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                labelFormatter={formatTooltipLabel}
                formatter={formatTooltipValue("Growth Rate", "%")}
              />
              <Bar dataKey="growthRate" radius={[2, 2, 0, 0]}>
                {growthRows.map((row) => (
                  <Cell
                    key={row.platform}
                    fill={row.growthRate >= 0 ? PLATFORM_META[row.platform].color : "var(--danger)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="overflow-x-auto border border-border bg-surface">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted">
              <th className="py-3 pl-4 pr-4 font-mono font-normal">PLATFORM</th>
              {METRIC_COLUMNS.map((col) => (
                <th key={col.key} className="py-3 pr-4 text-right font-mono font-normal">
                  {col.label.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const meta = PLATFORM_META[row.platform];
              return (
                <tr key={row.platform} className="border-b border-border last:border-b-0">
                  <td className="py-3 pl-4 pr-4">
                    <span className="flex items-center gap-2 font-medium" style={{ color: meta.color }}>
                      <meta.Icon size={16} />
                      {meta.label}
                    </span>
                  </td>
                  {METRIC_COLUMNS.map((col) => (
                    <td key={col.key} className="py-3 pr-4 text-right text-ink">
                      {formatNumber(row[col.key])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => {
          const meta = PLATFORM_META[row.platform];
          return (
            <div key={row.platform} className="border border-border bg-surface p-5">
              <div className="flex items-center gap-2 border-b border-border pb-3" style={{ color: meta.color }}>
                <meta.Icon size={18} />
                <p className="font-display text-sm font-bold text-ink">{meta.label}</p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                {METRIC_COLUMNS.map((col) => (
                  <div key={col.key}>
                    <p className="text-muted">{col.label}</p>
                    <p className="mt-0.5 font-display text-base font-bold text-ink">{formatNumber(row[col.key])}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}