"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import QuickActions from "@/components/dashboard/overview/QuickActions";
import { RecentPosts, UpcomingQueue } from "@/components/dashboard/overview/ActivityWidgets";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { MOCK_CLIENTS } from "@/lib/mockClients";

const MOCK = {
  draftPosts: 4,
  scheduledPosts: MOCK_CLIENTS.reduce((sum, c) => sum + c.scheduledPosts, 0),
  runningCampaigns: MOCK_CLIENTS.reduce((sum, c) => sum + c.activeCampaigns, 0),
  todaysQueue: 3,
};

function timeAgo(iso: string) {
  const hours = Math.round((Date.now() - new Date(iso).getTime()) / 3600_000);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function MarketingTeamOverview() {
  const teamActivity = useNotificationsStore((s) => s.teamActivity).slice(0, 4);

  return (
    <div className="space-y-8">
      <QuickActions
        actions={[
          { label: "Search Clients", href: "/marketing-team/clients", icon: "Search", primary: true },
          { label: "Notifications", href: "/marketing-team/notifications", icon: "Bell" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned Clients" value={MOCK_CLIENTS.length} />
        <StatCard label="Running Campaigns" value={MOCK.runningCampaigns} />
        <StatCard label="Draft Posts" value={MOCK.draftPosts} />
        <StatCard label="Today's Queue" value={MOCK.todaysQueue} />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Your clients</h2>
          <Link href="/marketing-team/clients" className="text-sm text-ink underline hover:no-underline">
            View all
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_CLIENTS.map((client, i) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Link
                href={`/marketing-team/clients/${client.id}`}
                className="block border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <p className="font-display font-bold">{client.name}</p>
                <p className="mt-2 text-xs text-muted">
                  {client.activeCampaigns} active campaigns &middot; {client.scheduledPosts} scheduled
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentPosts readOnly />
        <UpcomingQueue readOnly />
      </div>

      <div className="border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <p className="font-display font-bold">Recent team activity</p>
          <Link href="/marketing-team/notifications" className="text-xs underline hover:no-underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-border">
          {teamActivity.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-start gap-3 px-6 py-4"
            >
              <MessageSquare size={15} className="mt-0.5 shrink-0 text-muted" />
              <div className="min-w-0 flex-1">
                <p className="text-sm">{a.description}</p>
                <p className="mt-1 font-mono text-[11px] text-muted">
                  {a.userName}
                  {a.campaignName ? ` · ${a.campaignName}` : ""}
                </p>
              </div>
              <span className="shrink-0 font-mono text-xs text-muted">{timeAgo(a.timestamp)}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
