"use client";

import { motion } from "framer-motion";
import { useAdminUsersStore } from "@/store/useAdminUsersStore";
import { ROLE_LABELS } from "@/lib/validation";

// Dashboard polish pass — real recent-signups list from useAdminUsersStore
// (the same store the full User Management page uses), sorted by the
// actual stored joinedAt date. The relative-time label ("2d ago") is
// computed from that real date rather than hand-written per row.

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  if (diffMinutes < 60) return `${Math.max(diffMinutes, 0)}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.round(diffDays / 30);
  return `${diffMonths}mo ago`;
}

export default function RecentRegistrations({ limit = 5 }: { limit?: number }) {
  const users = useAdminUsersStore((s) => s.users);
  const recent = users
    .slice()
    .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
    .slice(0, limit);

  return (
    <div className="border border-border bg-surface">
      <div className="border-b border-border px-5 py-3">
        <p className="font-display font-bold">Recent registrations</p>
      </div>
      <div className="divide-y divide-border">
        {recent.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center justify-between px-5 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="font-mono text-xs text-muted">{ROLE_LABELS[user.role]}</p>
            </div>
            <span className="shrink-0 text-xs text-muted">{relativeTime(user.joinedAt)}</span>
          </motion.div>
        ))}
        {recent.length === 0 ? <p className="px-5 py-6 text-center text-sm text-muted">No users yet.</p> : null}
      </div>
    </div>
  );
}