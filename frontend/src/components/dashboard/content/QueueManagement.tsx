"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePostsStore } from "@/store/usePostsStore";
import { PLATFORM_META } from "@/components/dashboard/accounts/platformMeta";
import type { SocialPlatform } from "@/lib/constants";
import PublishNowButton from "@/components/dashboard/publishing/PublishNowButton";

export default function QueueManagement({
  basePath,
  readOnly = false,
}: {
  basePath: string;
  readOnly?: boolean;
}) {
  const posts = usePostsStore((s) => s.posts)
    .filter((p) => p.status === "scheduled")
    .sort((a, b) => `${a.scheduledDate}${a.scheduledTime}`.localeCompare(`${b.scheduledDate}${b.scheduledTime}`));
  const fetchPosts = usePostsStore((s) => s.fetchPosts);
  const cancelPost = usePostsStore((s) => s.cancelPost);

  useEffect(() => {
    fetchPosts({ status: "scheduled" });
  }, [fetchPosts]);

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {posts.map((post) => (
          <motion.div
            key={post.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="flex items-center justify-between border border-border bg-surface p-4"
          >
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="shrink-0 text-center">
                <p className="font-mono text-xs text-muted">{post.scheduledDate}</p>
                <p className="font-display text-sm font-bold">{post.scheduledTime}</p>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm">{post.caption}</p>
                <div className="mt-1 flex gap-1">
                  {post.platforms.map((p) => {
                    const meta = PLATFORM_META[p as SocialPlatform];
                    return meta ? <meta.Icon key={p} size={12} color={meta.color} /> : null;
                  })}
                </div>
              </div>
            </div>
            {!readOnly ? (
              <div className="flex shrink-0 items-center gap-3">
                <PublishNowButton post={post} variant="button" />
                <Link href={`${basePath}/${post.id}/edit`} className="text-sm underline hover:no-underline">
                  Edit
                </Link>
                <button
                  onClick={() => cancelPost(post.id)}
                  className="text-sm text-muted underline hover:no-underline"
                >
                  Cancel
                </button>
              </div>
            ) : null}
          </motion.div>
        ))}
      </AnimatePresence>

      {posts.length === 0 ? (
        <p className="border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
          Nothing in the queue right now.
        </p>
      ) : null}
    </div>
  );
}
