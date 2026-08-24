"use client";

import { motion } from "framer-motion";
import { usePostsStore } from "@/store/usePostsStore";
import { STATUS_META } from "@/lib/content";
import type { PostStatus } from "@/types";

// Dashboard polish pass — compact status breakdown reused by the Business
// Owner and Content Creator overview pages. Reads usePostsStore directly
// (same pattern as ConnectedPlatformsStrip); no new mock data is generated
// here. Reuses STATUS_META (lib/content.ts) for labels/icons/colors so
// this always matches StatusBadge everywhere else.

// Funnel order (draft -> review -> scheduled -> published), with the two
// terminal failure states last — every PostStatus value is covered here.
const ALL_STATUSES: PostStatus[] = ["draft", "pending_approval", "scheduled", "published", "failed", "cancelled"];

export default function PostStatusBreakdown({ title = "Post status" }: { title?: string }) {
  const posts = usePostsStore((s) => s.posts);
  const total = posts.length;
  const counts = ALL_STATUSES.map((status) => ({
    status,
    count: posts.filter((p) => p.status === status).length,
  })).filter((row) => row.count > 0);

  return (
    <div className="border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <p className="font-display font-bold">{title}</p>
        <span className="font-mono text-xs text-muted">{total} total</span>
      </div>
      <div className="space-y-3 p-5">
        {counts.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">No posts yet.</p>
        ) : (
          counts.map(({ status, count }, i) => {
            const meta = STATUS_META[status];
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <motion.div
                key={status}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={`flex items-center gap-1.5 font-mono ${meta.className}`}>
                    <meta.icon size={12} />
                    {meta.label.toUpperCase()}
                  </span>
                  <span className="text-muted">{count}</span>
                </div>
                <div className="mt-1 h-1.5 w-full bg-background">
                  <motion.div
                    className="h-1.5 bg-ink"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                  />
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}