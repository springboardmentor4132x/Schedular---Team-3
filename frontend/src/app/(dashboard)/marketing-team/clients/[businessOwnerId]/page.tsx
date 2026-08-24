import { notFound } from "next/navigation";
import StatCard from "@/components/dashboard/StatCard";
import { getMockClient } from "@/lib/mockClients";

export default async function ClientOverview({
  params,
}: {
  params: Promise<{ businessOwnerId: string }>;
}) {
  const { businessOwnerId } = await params;
  const client = getMockClient(businessOwnerId);
  if (!client) notFound();

  return (
    <div className="space-y-6">
      <div className="border border-border bg-surface p-5">
        <p className="font-mono text-xs text-muted">CLIENT OVERVIEW</p>
        <p className="mt-1 font-display text-xl font-bold">{client.name} Summer Sale</p>
        <p className="mt-1 text-sm text-muted">Most recent campaign for this client.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Campaigns" value={client.activeCampaigns} />
        <StatCard label="Scheduled Posts" value={client.scheduledPosts} />
        <StatCard label="Published Posts" value={38} />
        <StatCard label="Engagement" value="4.2%" hint="Avg. across published posts" />
      </div>
    </div>
  );
}
