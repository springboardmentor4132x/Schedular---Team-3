"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Wallet, Eye, Pencil, Trash2 } from "lucide-react";
import type { Campaign } from "@/types";
import { useCampaignsStore } from "@/store/useCampaignsStore";
import CampaignStatusBadge from "./CampaignStatusBadge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
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

// Progress reflects how far the campaign has moved through its scheduled
// window. Draft campaigns haven't started (0%); completed ones are done
// (100%) regardless of the clock, since a campaign can be marked complete
// early. Active/paused campaigns are the actual elapsed-time calculation.
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

export default function CampaignCard({ campaign }: { campaign: Campaign }) {
  const { deleteCampaign } = useCampaignsStore();
  const pathname = usePathname();
  const progress = calcProgress(campaign);

  // CampaignCard always renders on the campaigns list route (e.g.
  // /business-owner/campaigns), so appending the id/edit segments here
  // works identically across all three role trees.
  const detailsHref = `${pathname}/${campaign.id}`;
  const editHref = `${pathname}/${campaign.id}/edit`;

  function handleDelete() {
    const confirmed = window.confirm(`Delete "${campaign.name}"? This can't be undone.`);
    if (!confirmed) return;
    // TODO once the backend is live: deleteCampaign will call the API — see
    // the TODO in useCampaignsStore.ts.
    deleteCampaign(campaign.id);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col border border-border bg-surface p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-base font-bold">{campaign.name}</p>
          <p className="mt-1 text-sm text-muted">{campaign.objectives}</p>
        </div>
        <CampaignStatusBadge status={campaign.status} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
        <span className="flex items-center gap-1">
          <Wallet size={12} />
          {formatBudget(campaign.budget)}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {formatDate(campaign.startDate)} &ndash; {formatDate(campaign.endDate)}
        </span>
        <span className="border border-border px-2 py-0.5 font-mono text-[10px] uppercase">
          {campaign.platform}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between font-mono text-[11px] text-muted">
          <span>PROGRESS</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full bg-border">
          <motion.div
            className="h-1.5 bg-ink"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="border border-border p-3">
          <p className="font-mono text-[10px] text-muted">SCHEDULED POSTS</p>
          <p className="mt-1 font-display text-lg font-bold">{campaign.scheduledPosts}</p>
        </div>
        <div className="border border-border p-3">
          <p className="font-mono text-[10px] text-muted">PUBLISHED POSTS</p>
          <p className="mt-1 font-display text-lg font-bold">{campaign.publishedPosts}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-sm">
        <Link
          href={detailsHref}
          className="flex flex-1 items-center justify-center gap-1.5 border border-ink/30 px-3 py-2 font-medium hover:bg-background"
        >
          <Eye size={14} />
          View Details
        </Link>
        <Link
          href={editHref}
          className="flex items-center justify-center gap-1.5 border border-ink/30 px-3 py-2 font-medium hover:bg-background"
          aria-label="Edit campaign"
        >
          <Pencil size={14} />
        </Link>
        <button
          onClick={handleDelete}
          className="flex items-center justify-center gap-1.5 border border-ink/30 px-3 py-2 font-medium text-muted hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          aria-label="Delete campaign"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}