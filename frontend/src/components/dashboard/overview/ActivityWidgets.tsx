"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePostsStore } from "@/store/usePostsStore";
import { PLATFORM_META } from "@/components/dashboard/accounts/platformMeta";
import StatusBadge from "@/components/dashboard/content/StatusBadge";
import type { SocialPlatform } from "@/lib/constants";

export function RecentPosts({
  editBasePath,
  limit = 5,
  readOnly = false,
}: {
  editBasePath?: string;
  limit?: number;
  readOnly?: boolean;
}) {
  const posts = usePostsStore((s) => s.posts)
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);

  return (
    <div className="border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <p className="font-display font-bold">Recent posts</p>
        {!readOnly && editBasePath ? (
          <Link href={editBasePath.replace(/\/[^/]+$/, "")} className="text-xs underline hover:no-underline">
            View all
          </Link>
        ) : null}
      </div>
      <div className="divide-y divide-border">
        {posts.map((post, i) => {
          const row = (
            <div className="flex items-center justify-between gap-3 px-5 py-3">
              <p className="min-w-0 flex-1 truncate text-sm">{post.caption}</p>
              <span className="flex shrink-0 items-center gap-2">
                {post.platforms.slice(0, 3).map((p) => {
                  const meta = PLATFORM_META[p as SocialPlatform];
                  return meta ? <meta.Icon key={p} size={12} color={meta.color} /> : null;
                })}
                <StatusBadge status={post.status} />
              </span>
            </div>
          );
          return (
            <motion.div key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
              {readOnly || !editBasePath ? (
                row
              ) : (
                <Link href={`${editBasePath}/${post.id}/edit`} className="block hover:bg-background">
                  {row}
                </Link>
              )}
            </motion.div>
          );
        })}
        {posts.length === 0 ? <p className="px-5 py-6 text-center text-sm text-muted">Nothing yet.</p> : null}
      </div>
    </div>
  );
}

export function UpcomingQueue({
  editBasePath,
  limit = 3,
  readOnly = false,
}: {
  editBasePath?: string;
  limit?: number;
  readOnly?: boolean;
}) {
  const posts = usePostsStore((s) => s.posts)
    .filter((p) => p.status === "scheduled")
    .sort((a, b) => `${a.scheduledDate}${a.scheduledTime}`.localeCompare(`${b.scheduledDate}${b.scheduledTime}`))
    .slice(0, limit);

  return (
    <div className="border border-border bg-surface">
      <div className="border-b border-border px-5 py-3">
        <p className="font-display font-bold">Coming up</p>
      </div>
      <div className="divide-y divide-border">
        {posts.map((post, i) => {
          const row = (
            <div className="flex items-center gap-4 px-5 py-3">
              <div className="shrink-0 text-center">
                <p className="font-mono text-xs text-muted">{post.scheduledDate}</p>
                <p className="font-display text-sm font-bold">{post.scheduledTime}</p>
              </div>
              <p className="min-w-0 flex-1 truncate text-sm">{post.caption}</p>
            </div>
          );
          return (
            <motion.div key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
              {readOnly || !editBasePath ? (
                row
              ) : (
                <Link href={`${editBasePath}/${post.id}/edit`} className="block hover:bg-background">
                  {row}
                </Link>
              )}
            </motion.div>
          );
        })}
        {posts.length === 0 ? (
          <p className="px-5 py-6 text-center text-sm text-muted">Nothing scheduled yet.</p>
        ) : null}
      </div>
    </div>
  );
}
