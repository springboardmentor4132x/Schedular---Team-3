"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Megaphone,
  ClipboardList,
  RefreshCw,
  FileSearch,
  Send,
  MessageSquare,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { useNotificationsStore, type TeamActivityItem } from "@/store/useNotificationsStore";

const TYPE_META: Record<TeamActivityItem["type"], { label: string; icon: LucideIcon }> = {
  campaign_assigned: { label: "Campaign Assigned", icon: Megaphone },
  task_assigned: { label: "Task Assigned", icon: ClipboardList },
  campaign_updated: { label: "Campaign Updated", icon: RefreshCw },
  content_review_requested: { label: "Review Requested", icon: FileSearch },
  publishing_approval_requested: { label: "Approval Requested", icon: Send },
  comment_added: { label: "Comment", icon: MessageSquare },
  task_completed: { label: "Task Completed", icon: CheckCircle2 },
};

function timeAgo(iso: string) {
  const hours = Math.round((Date.now() - new Date(iso).getTime()) / 3600_000);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function TeamActivityFeed() {
  const teamActivity = useNotificationsStore((s) => s.teamActivity);
  const [query, setQuery] = useState("");
  const [campaignFilter, setCampaignFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");

  const campaigns = useMemo(
    () => Array.from(new Set(teamActivity.map((a) => a.campaignName).filter(Boolean))) as string[],
    [teamActivity]
  );
  const users = useMemo(() => Array.from(new Set(teamActivity.map((a) => a.userName))), [teamActivity]);

  const filtered = useMemo(() => {
    return teamActivity
      .filter((a) => (campaignFilter === "all" ? true : a.campaignName === campaignFilter))
      .filter((a) => (userFilter === "all" ? true : a.userName === userFilter))
      .filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.description.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [teamActivity, query, campaignFilter, userFilter]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search team activity…"
            className="w-full border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-accent-hover"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="border border-border bg-surface px-3 py-2 text-xs outline-none"
          >
            <option value="all">All campaigns</option>
            {campaigns.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="border border-border bg-surface px-3 py-2 text-xs outline-none"
          >
            <option value="all">All team members</option>
            {users.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 divide-y divide-border border border-border bg-surface">
        {filtered.map((a, i) => {
          const meta = TYPE_META[a.type];
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="flex items-start gap-3 px-5 py-4"
            >
              <meta.icon size={16} className="mt-0.5 shrink-0 text-ink" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{a.title}</p>
                  <span className="border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted">
                    {meta.label.toUpperCase()}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-muted">{a.description}</p>
                <p className="mt-1 font-mono text-[11px] text-muted">
                  {a.userName}
                  {a.campaignName ? ` · ${a.campaignName}` : ""}
                </p>
              </div>
              <span className="shrink-0 font-mono text-xs text-muted">{timeAgo(a.timestamp)}</span>
            </motion.div>
          );
        })}

        {filtered.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">No activity matches these filters.</p>
        ) : null}
      </div>
    </div>
  );
}
