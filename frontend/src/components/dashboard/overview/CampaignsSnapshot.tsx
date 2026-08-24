"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useCampaignsStore } from "@/store/useCampaignsStore";
import CampaignStatusBadge from "@/components/dashboard/campaigns/CampaignStatusBadge";
import type { Campaign } from "@/types";

// Dashboard polish pass — compact campaigns list reused by the Business
// Owner and Content Creator overview pages. Reads useCampaignsStore
// directly (same pattern as ConnectedPlatformsStrip) and shows the most
// relevant campaigns (active first, then most recently started) with the
// same status badge and budget formatting used on the full Campaigns page
// — no new data, just a denser view of what's already there.

function formatBudget(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Same elapsed-time progress calculation CampaignCard uses, kept local
// since this widget only needs the number, not the full card.
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

const STATUS_PRIORITY: Record<Campaign["status"], number> = { active: 0, draft: 1, paused: 2, completed: 3 };

export default function CampaignsSnapshot({ viewAllHref, limit = 4 }: { viewAllHref: string; limit?: number }) {
  const campaigns = useCampaignsStore((s) => s.campaigns);
  const rows = campaigns
    .slice()
    .sort((a, b) => {
      const byStatus = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
      if (byStatus !== 0) return byStatus;
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    })
    .slice(0, limit);

  return (
    <div className="border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <p className="font-display font-bold">Campaigns</p>
        <Link href={viewAllHref} className="text-xs underline hover:no-underline">
          View all
        </Link>
      </div>
      <div className="divide-y divide-border">
        {rows.map((campaign, i) => {
          const progress = calcProgress(campaign);
          return (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="px-5 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 flex-1 truncate text-sm font-medium">{campaign.name}</p>
                <CampaignStatusBadge status={campaign.status} />
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-1.5 flex-1 bg-background">
                  <div className="h-1.5 bg-ink" style={{ width: `${progress}%` }} />
                </div>
                <span className="shrink-0 font-mono text-[11px] text-muted">{formatBudget(campaign.budget)}</span>
              </div>
            </motion.div>
          );
        })}
        {rows.length === 0 ? <p className="px-5 py-6 text-center text-sm text-muted">No campaigns yet.</p> : null}
      </div>
    </div>
  );
}