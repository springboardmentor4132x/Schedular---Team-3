"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, RefreshCw, CheckCircle2, Circle, FileEdit } from "lucide-react";
import { useCampaignsStore } from "@/store/useCampaignsStore";
import StatCard from "@/components/dashboard/StatCard";
import CampaignStatusBadge from "./CampaignStatusBadge";
import type { Campaign } from "@/types";

const DAY_MS = 1000 * 60 * 60 * 24;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Same calculation used by CampaignCard/CampaignAnalytics, kept as a local
// copy so this component has no dependency on either of them.
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

function calcDuration(campaign: Campaign) {
  const start = new Date(campaign.startDate).getTime();
  const end = new Date(campaign.endDate).getTime();
  const now = Date.now();

  const totalDays = Math.max(0, Math.round((end - start) / DAY_MS));
  const elapsedDays = Math.min(totalDays, Math.max(0, Math.round((now - start) / DAY_MS)));
  const remainingDays = Math.max(0, totalDays - elapsedDays);

  return { totalDays, elapsedDays, remainingDays };
}

export default function CampaignTimeline({ campaignId }: { campaignId: string }) {
  const { hasLoaded, isLoading, fetchCampaigns, getCampaignById } = useCampaignsStore();
  const pathname = usePathname();

  // Covers a direct link/refresh landing here before the dashboard has ever
  // populated the store. fetchCampaigns is idempotent (see its own guard).
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // This page lives at .../campaigns/[campaignId]/timeline — stripping
  // both trailing segments gets back to the list; stripping just /timeline
  // gets back to Details.
  const listHref = pathname.slice(0, pathname.length - `/${campaignId}/timeline`.length);
  const detailsHref = pathname.slice(0, pathname.length - "/timeline".length);

  if (isLoading || !hasLoaded) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border bg-surface p-16 text-center">
        <RefreshCw size={20} className="animate-spin text-muted" />
        <p className="text-sm text-muted">Loading campaign timeline…</p>
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
  const { totalDays, elapsedDays, remainingDays } = calcDuration(campaign);

  const hasStarted = campaign.status !== "draft";
  const hasEnded = campaign.status === "completed" || Date.now() >= new Date(campaign.endDate).getTime();

  const milestones = [
    {
      label: "Campaign Created",
      detail: "Draft set up with budget, objectives, and schedule.",
      done: true,
    },
    {
      label: `Campaign Starts — ${formatDate(campaign.startDate)}`,
      detail: hasStarted ? "Campaign is live and posts are running." : "Not started yet.",
      done: hasStarted,
    },
    {
      label: `Campaign Ends — ${formatDate(campaign.endDate)}`,
      detail: hasEnded ? "Campaign window has closed." : `${remainingDays} day${remainingDays === 1 ? "" : "s"} remaining.`,
      done: hasEnded,
    },
  ];

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
        <p className="mt-1 text-sm text-muted">Campaign Timeline</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Duration" value={`${totalDays} days`} />
        <StatCard label="Days Elapsed" value={elapsedDays} />
        <StatCard label="Days Remaining" value={remainingDays} />
        <StatCard label="Scheduled Posts" value={campaign.scheduledPosts} />
      </div>

      <div className="border border-border bg-surface p-6">
        <div className="flex items-center justify-between text-xs text-muted">
          <span className="font-mono">{formatDate(campaign.startDate)}</span>
          <span className="font-mono">{progress}% COMPLETE</span>
          <span className="font-mono">{formatDate(campaign.endDate)}</span>
        </div>
        <div className="relative mt-2 h-2 w-full bg-border">
          <div className="h-2 bg-ink transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-8 space-y-5">
          {milestones.map((milestone) => (
            <div key={milestone.label} className="flex items-start gap-3">
              {milestone.done ? (
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-ink" />
              ) : (
                <Circle size={18} className="mt-0.5 shrink-0 text-muted" />
              )}
              <div>
                <p className={`text-sm font-medium ${milestone.done ? "text-ink" : "text-muted"}`}>
                  {milestone.label}
                </p>
                <p className="mt-0.5 text-xs text-muted">{milestone.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2 border border-dashed border-border bg-surface p-4 text-xs text-muted">
        <FileEdit size={14} className="mt-0.5 shrink-0" />
        <p>
          This timeline is based on the campaign&rsquo;s own start/end dates and status. A
          post-by-post schedule view will be added once campaigns and posts are linked together.
        </p>
      </div>
    </div>
  );
}