"use client";

import { Search, ChevronDown, Plus } from "lucide-react";
import { CAMPAIGN_STATUS } from "@/lib/constants";
import type { CampaignStatus } from "@/types";

export type CampaignSortOption = "startDate" | "name" | "budget";

export const SORT_OPTIONS: { value: CampaignSortOption; label: string }[] = [
  { value: "startDate", label: "Start Date" },
  { value: "name", label: "Name (A–Z)" },
  { value: "budget", label: "Budget (High to Low)" },
];

export default function CampaignToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  onCreateClick,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: CampaignStatus | "all";
  onStatusFilterChange: (value: CampaignStatus | "all") => void;
  sortBy: CampaignSortOption;
  onSortByChange: (value: CampaignSortOption) => void;
  onCreateClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search campaigns…"
            className="w-full border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-accent-hover"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as CampaignStatus | "all")}
            className="appearance-none border border-border bg-surface py-2 pl-3 pr-8 text-sm capitalize outline-none focus:border-accent-hover"
          >
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
            onChange={(e) => onSortByChange(e.target.value as CampaignSortOption)}
            className="appearance-none border border-border bg-surface py-2 pl-3 pr-8 text-sm outline-none focus:border-accent-hover"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                Sort: {option.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" />
        </div>
      </div>

      <button
        onClick={onCreateClick}
        className="inline-flex items-center justify-center gap-2 bg-accent px-5 py-2.5 text-sm font-medium text-ink hover:bg-accent-hover"
      >
        <Plus size={16} />
        Create Campaign
      </button>
    </div>
  );
}