"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Megaphone } from "lucide-react";
import type { CampaignStatus } from "@/types";
import { useCampaignsStore } from "@/store/useCampaignsStore";
import CampaignStatsBar from "./CampaignStatsBar";
import CampaignToolbar, { type CampaignSortOption } from "./CampaignToolbar";
import CampaignCard from "./CampaignCard";

const gridContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

export default function CampaignDashboard() {
  const { campaigns, isLoading, hasLoaded, fetchCampaigns } = useCampaignsStore();
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");
  const [sortBy, setSortBy] = useState<CampaignSortOption>("startDate");

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const visibleCampaigns = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = campaigns.filter((c) => {
      const matchesQuery =
        query === "" ||
        c.name.toLowerCase().includes(query) ||
        c.objectives.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesQuery && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "budget") return b.budget - a.budget;
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
  }, [campaigns, search, statusFilter, sortBy]);

  function handleCreateClick() {
    router.push(`${pathname}/create`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold">Campaign Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Track budgets, schedules, and performance for every campaign in one place.
        </p>
      </div>

      <CampaignStatsBar campaigns={campaigns} />

      <CampaignToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onCreateClick={handleCreateClick}
      />

      {isLoading || !hasLoaded ? (
        <CampaignGridSkeleton />
      ) : visibleCampaigns.length === 0 ? (
        <CampaignEmptyState
          hasAnyCampaigns={campaigns.length > 0}
          onCreateClick={handleCreateClick}
        />
      ) : (
        <motion.div
          variants={gridContainer}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {visibleCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function CampaignGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse border border-border bg-surface p-5">
          <div className="h-4 w-2/3 bg-border" />
          <div className="mt-2 h-3 w-full bg-border" />
          <div className="mt-1 h-3 w-4/5 bg-border" />
          <div className="mt-5 h-1.5 w-full bg-border" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="h-14 bg-border" />
            <div className="h-14 bg-border" />
          </div>
          <div className="mt-4 h-9 w-full bg-border" />
        </div>
      ))}
    </div>
  );
}

function CampaignEmptyState({
  hasAnyCampaigns,
  onCreateClick,
}: {
  hasAnyCampaigns: boolean;
  onCreateClick: () => void;
}) {
  return (
    <div className="flex flex-col items-center border border-dashed border-border bg-surface p-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center border border-border bg-background">
        <Megaphone size={20} className="text-muted" />
      </div>
      <h2 className="mt-4 font-display text-lg font-bold">
        {hasAnyCampaigns ? "No campaigns match your filters" : "No campaigns yet"}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted">
        {hasAnyCampaigns
          ? "Try a different search term or clear the status filter."
          : "Create your first campaign to start tracking budgets, schedules, and posts."}
      </p>
      {!hasAnyCampaigns ? (
        <button
          onClick={onCreateClick}
          className="mt-5 inline-flex items-center gap-2 bg-accent px-5 py-2.5 text-sm font-medium text-ink hover:bg-accent-hover"
        >
          Create Campaign
        </button>
      ) : null}
    </div>
  );
}