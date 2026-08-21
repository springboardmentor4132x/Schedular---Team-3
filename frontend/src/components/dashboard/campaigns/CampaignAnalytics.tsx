"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, RefreshCw, BarChart3 } from "lucide-react";
import { useCampaignsStore } from "@/store/useCampaignsStore";
import StatCard from "@/components/dashboard/StatCard";
import CampaignStatusBadge from "./CampaignStatusBadge";
import type { Campaign } from "@/types";

function formatPercent(n: number) {
  return `${n}%`;
}

function formatCount(n: number) {
  return n.toLocaleString("en-US");
}

function formatRoi(n: number) {
  return `${n}x`;
}

// Same calculation used by CampaignCard's progress bar, kept as a local
// copy rather than an import so this component has no dependency on
// CampaignCard — Completion Percentage doesn't rely on metrics being present.
function calcProgress(campaign: Campaign): number {
  if (campaign.status === "draft") return 0;
  if (campaign.status === "completed") return 100;

  const start = new Date(campaign.startDate).getTime();
  const end = new Date(campaign.endDate).getTime();
  const now = Date.now();

  if (now <= start) return 0;
  if (now >= end || end <= start) return 100;

  return Math.round(((now - start) / (end - start)) * 100);
}

export default function CampaignAnalytics({ campaignId }: { campaignId: string }) {
  const { hasLoaded, isLoading, fetchCampaigns, getCampaignById } = useCampaignsStore();
  const pathname = usePathname();

  // Covers a direct link/refresh landing here before the dashboard has ever
  // populated the store. fetchCampaigns is idempotent (see its own guard).
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // This page lives at .../campaigns/[campaignId]/analytics — stripping
  // both trailing segments gets back to the list; stripping just /analytics
  // gets back to Details.
  const listHref = pathname.slice(0, pathname.length - `/${campaignId}/analytics`.length);
  const detailsHref = pathname.slice(0, pathname.length - "/analytics".length);

  if (isLoading || !hasLoaded) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border bg-surface p-16 text-center">
        <RefreshCw size={20} className="animate-spin text-muted" />
        <p className="text-sm text-muted">Loading campaign analytics…</p>
      </div>
    );
  }

  const campaign = getCampaignById(campaignId);

  if (!campaign) {
    return (
      <div className="flex flex-col items-center gap-3 border border-dashed border-border bg-surface p-16 text-center">
        <h1 className="font-display text-lg font-bold">Campaign not found</h1>
        <p className="max-w-sm text-sm text-muted">
          This campaign may have been deleted, or the link is out of date.
        </p>
        <Link
          href={listHref}
          className="mt-2 inline-flex items-center gap-2 bg-accent px-5 py-2.5 text-sm font-medium text-ink hover:bg-accent-hover">
          <ArrowLeft size={14} />
          Back to Campaign Dashboard
        </Link>
      </div>
    );
  }

  const progress = calcProgress(campaign);
  const metrics = campaign.metrics;

  return (
    <div className="space-y-6">
      <Link
        href={detailsHref}
        className="flex w-fit items-center gap-1.5 text-xs text-muted hover:text-ink">
        <ArrowLeft size={12} />
        Back to Campaign Details
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-xl font-bold">{campaign.name}</h1>
          <CampaignStatusBadge status={campaign.status} />
        </div>
        <p className="mt-1 text-sm text-muted">Campaign Analytics Overview</p>
      </div>

      {/* Always available regardless of whether metrics exist yet. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Scheduled Posts" value={campaign.scheduledPosts} />
        <StatCard label="Published Posts" value={campaign.publishedPosts} />
        <StatCard label="Completion" value={formatPercent(progress)} />
        <StatCard label="Campaign Status" value={campaign.status} />
      </div>

      {metrics ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Engagement" value={formatPercent(metrics.engagement)} />
          <StatCard label="Reach" value={formatCount(metrics.reach)} />
          <StatCard label="Impressions" value={formatCount(metrics.impressions)} />
          <StatCard label="Clicks" value={formatCount(metrics.clicks)} />
          <StatCard label="ROI" value={formatRoi(metrics.roi)} />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 border border-dashed border-border bg-surface p-12 text-center">
          <div className="flex h-10 w-10 items-center justify-center border border-border bg-background">
            <BarChart3 size={18} className="text-muted" />
          </div>
          <h2 className="mt-1 font-display text-base font-bold">No analytics available yet</h2>
          <p className="max-w-sm text-sm text-muted">
            Engagement, reach, impressions, clicks, and ROI will appear here once this campaign
            starts publishing posts.
          </p>
        </div>
      )}

      <div className="border border-border bg-surface p-5">
        <div className="flex items-center justify-between font-mono text-[11px] text-muted">
          <span>CAMPAIGN PROGRESS</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full bg-border">
          <div className="h-1.5 bg-ink transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted">
          Based on today&rsquo;s date relative to the campaign&rsquo;s start and end dates.
        </p>
      </div>
    </div>
  );
}