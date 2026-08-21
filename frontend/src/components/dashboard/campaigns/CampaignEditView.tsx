"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useCampaignsStore } from "@/store/useCampaignsStore";
import CampaignForm from "./CampaignForm";

export default function CampaignEditView({ campaignId }: { campaignId: string }) {
  const { hasLoaded, isLoading, fetchCampaigns, getCampaignById } = useCampaignsStore();
  const pathname = usePathname();

  // Covers a direct link/refresh landing here before the dashboard has ever
  // populated the store. fetchCampaigns is idempotent (see its own guard).
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // This page lives at .../campaigns/[campaignId]/edit — stripping both
  // trailing segments gets back to the list.
  const listHref = pathname.slice(0, pathname.length - `/${campaignId}/edit`.length);

  if (isLoading || !hasLoaded) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border bg-surface p-16 text-center">
        <RefreshCw size={20} className="animate-spin text-muted" />
        <p className="text-sm text-muted">Loading campaign…</p>
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

  return (
    <div className="space-y-6">
      <Link
        href={`${pathname.slice(0, pathname.length - "/edit".length)}`}
        className="flex w-fit items-center gap-1.5 text-xs text-muted hover:text-ink">
        <ArrowLeft size={12} />
        Back to Campaign Details
      </Link>

      <div>
        <h1 className="font-display text-xl font-bold">Edit Campaign</h1>
        <p className="mt-1 text-sm text-muted">Update the details for &ldquo;{campaign.name}&rdquo;.</p>
      </div>

      <CampaignForm campaign={campaign} />
    </div>
  );
}