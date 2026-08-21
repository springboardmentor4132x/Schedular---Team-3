"use client";

import { useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/lib/constants";
import { CONTENT_TYPES } from "@/lib/content";
import { useCampaignsStore } from "@/store/useCampaignsStore";
import type { ContentType } from "@/types";
import type { DateRangeFilter } from "@/types/analytics";

export const DATE_RANGE_OPTIONS: { value: DateRangeFilter; label: string }[] = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "12m", label: "Last 12 Months" },
  { value: "all", label: "All Time" },
];

export interface AnalyticsFilterValues {
  dateRange: DateRangeFilter;
  platform: SocialPlatform | "all";
  campaignId: string | "all";
  contentType: ContentType | "all";
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <label className="sr-only">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="appearance-none border border-border bg-surface py-2 pl-3 pr-8 text-sm capitalize outline-none focus:border-accent-hover">
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" />
    </div>
  );
}

export default function AnalyticsFilters({
  dateRange,
  onDateRangeChange,
  platform,
  onPlatformChange,
  campaignId,
  onCampaignChange,
  contentType,
  onContentTypeChange,
}: {
  dateRange: DateRangeFilter;
  onDateRangeChange: (value: DateRangeFilter) => void;
  platform: SocialPlatform | "all";
  onPlatformChange: (value: SocialPlatform | "all") => void;
  campaignId: string | "all";
  onCampaignChange: (value: string) => void;
  contentType: ContentType | "all";
  onContentTypeChange: (value: ContentType | "all") => void;
}) {
  const campaigns = useCampaignsStore((s) => s.campaigns);
  const fetchCampaigns = useCampaignsStore((s) => s.fetchCampaigns);

  // Reuses the campaigns store exactly as it already exists — fetchCampaigns
  // is idempotent (see its own guard), so this is safe even if a campaigns
  // page already loaded it this session.
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <FilterSelect label="Date range" value={dateRange} onChange={(v) => onDateRangeChange(v as DateRangeFilter)}>
        {DATE_RANGE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect
        label="Platform"
        value={platform}
        onChange={(v) => onPlatformChange(v as SocialPlatform | "all")}>
        <option value="all">All Platforms</option>
        {SOCIAL_PLATFORMS.map((p) => (
          <option key={p} value={p} className="capitalize">
            {p}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect label="Campaign" value={campaignId} onChange={onCampaignChange}>
        <option value="all">All Campaigns</option>
        {campaigns.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect
        label="Content type"
        value={contentType}
        onChange={(v) => onContentTypeChange(v as ContentType | "all")}>
        <option value="all">All Content Types</option>
        {CONTENT_TYPES.map((ct) => (
          <option key={ct.value} value={ct.value}>
            {ct.label}
          </option>
        ))}
      </FilterSelect>
    </div>
  );
}