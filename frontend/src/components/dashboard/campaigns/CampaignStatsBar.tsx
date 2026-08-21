import StatCard from "@/components/dashboard/StatCard";
import type { Campaign } from "@/types";

export default function CampaignStatsBar({ campaigns }: { campaigns: Campaign[] }) {
  const total = campaigns.length;
  const active = campaigns.filter((c) => c.status === "active").length;
  const completed = campaigns.filter((c) => c.status === "completed").length;
  const draft = campaigns.filter((c) => c.status === "draft").length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Campaigns" value={total} />
      <StatCard label="Active Campaigns" value={active} />
      <StatCard label="Completed Campaigns" value={completed} />
      <StatCard label="Draft Campaigns" value={draft} />
    </div>
  );
}