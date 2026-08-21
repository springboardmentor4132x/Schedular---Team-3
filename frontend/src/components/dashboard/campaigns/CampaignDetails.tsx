"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Calendar, Wallet, Pencil, Trash2, RefreshCw, BarChart3, Clock, FolderOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCampaignsStore } from "@/store/useCampaignsStore";
import CampaignStatusBadge from "./CampaignStatusBadge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatBudget(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const CATEGORY_LABELS: Record<string, string> = {
  product_launch: "Product Launch",
  brand_awareness: "Brand Awareness",
  promotion: "Promotion",
  event: "Event",
  seasonal: "Seasonal",
  other: "Other",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export default function CampaignDetails({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const campaign = useCampaignsStore((s) => s.getCampaignById(campaignId));
  const deleteCampaign = useCampaignsStore((s) => s.deleteCampaign);
  const isLoading = useCampaignsStore((s) => s.isLoading);
  const hasLoaded = useCampaignsStore((s) => s.hasLoaded);
  const fetchCampaigns = useCampaignsStore((s) => s.fetchCampaigns);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const listHref = pathname.slice(0, pathname.length - `/${campaignId}`.length);
  const editHref = `${pathname}/edit`;

  function handleDelete() {
    const confirmed = window.confirm(`Delete "${campaign!.name}"? This can't be undone.`);
    if (!confirmed) return;
    deleteCampaign(campaignId);
    router.push(listHref);
  }

  if (isLoading || !hasLoaded) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border bg-surface p-16 text-center">
        <RefreshCw size={20} className="animate-spin text-muted" />
        <p className="text-sm text-muted">Loading campaign…</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border bg-surface p-16 text-center">
        <p className="text-sm text-muted">Campaign not found.</p>
        <Link href={listHref} className="text-sm font-medium text-ink underline">
          Back to campaigns
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href={listHref} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={14} />
        Back to campaigns
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 border border-border bg-surface p-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl font-bold">{campaign.name}</h1>
            <CampaignStatusBadge status={campaign.status} />
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted">{campaign.objectives}</p>
          {campaign.description ? (
            <p className="mt-1 max-w-2xl text-sm text-muted">{campaign.description}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            {campaign.category ? (
              <span className="border border-border px-2 py-0.5 font-mono uppercase">
                {CATEGORY_LABELS[campaign.category] ?? campaign.category}
              </span>
            ) : null}
            {campaign.priority ? (
              <span className="border border-border px-2 py-0.5 font-mono uppercase">
                {PRIORITY_LABELS[campaign.priority] ?? campaign.priority} Priority
              </span>
            ) : null}
            <span className="border border-border px-2 py-0.5 font-mono uppercase">{campaign.platform}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={editHref}
            className="flex items-center justify-center gap-1.5 border border-ink/30 px-3 py-2 text-sm font-medium hover:bg-background"
          >
            <Pencil size={14} />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-1.5 border border-ink/30 px-3 py-2 text-sm font-medium text-muted hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-border bg-surface p-4">
          <p className="flex items-center gap-1.5 font-mono text-[10px] text-muted">
            <Wallet size={12} />
            BUDGET
          </p>
          <p className="mt-1 font-display text-lg font-bold">{formatBudget(campaign.budget)}</p>
        </div>
        <div className="border border-border bg-surface p-4">
          <p className="flex items-center gap-1.5 font-mono text-[10px] text-muted">
            <Calendar size={12} />
            SCHEDULE
          </p>
          <p className="mt-1 text-sm font-medium">
            {formatDate(campaign.startDate)} &ndash; {formatDate(campaign.endDate)}
          </p>
        </div>
        <div className="border border-border bg-surface p-4">
          <p className="flex items-center gap-1.5 font-mono text-[10px] text-muted">
            <Clock size={12} />
            SCHEDULED POSTS
          </p>
          <p className="mt-1 font-display text-lg font-bold">{campaign.scheduledPosts}</p>
        </div>
        <div className="border border-border bg-surface p-4">
          <p className="flex items-center gap-1.5 font-mono text-[10px] text-muted">
            <FolderOpen size={12} />
            PUBLISHED POSTS
          </p>
          <p className="mt-1 font-display text-lg font-bold">{campaign.publishedPosts}</p>
        </div>
      </div>

      {campaign.metrics ? (
        <div className="border border-border bg-surface p-5">
          <p className="flex items-center gap-1.5 font-mono text-xs text-muted">
            <BarChart3 size={13} />
            PERFORMANCE
          </p>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div>
              <p className="text-xs text-muted">Engagement</p>
              <p className="mt-0.5 font-display text-base font-bold">{campaign.metrics.engagement}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Reach</p>
              <p className="mt-0.5 font-display text-base font-bold">{campaign.metrics.reach}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Impressions</p>
              <p className="mt-0.5 font-display text-base font-bold">{campaign.metrics.impressions}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Clicks</p>
              <p className="mt-0.5 font-display text-base font-bold">{campaign.metrics.clicks}</p>
            </div>
            <div>
              <p className="text-xs text-muted">ROI</p>
              <p className="mt-0.5 font-display text-base font-bold">{campaign.metrics.roi}%</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-border bg-surface p-5 text-center text-sm text-muted">
          No performance data yet.
        </div>
      )}
    </div>
  );
}