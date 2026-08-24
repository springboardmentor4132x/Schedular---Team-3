"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePostsStore } from "@/store/usePostsStore";
import PublishNowButton from "@/components/dashboard/publishing/PublishNowButton";

export default function DraftManagement({
  basePath,
}: {
  basePath: string;
}) {
  const posts = usePostsStore((s) => s.posts).filter((p) => p.status === "draft");
  const fetchPosts = usePostsStore((s) => s.fetchPosts);
  const deletePost = usePostsStore((s) => s.deletePost);

  useEffect(() => {
    fetchPosts({ status: "draft" });
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
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{post.caption}</p>
              <p className="mt-1 font-mono text-xs text-muted">
                Last edited {new Date(post.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <PublishNowButton post={post} variant="button" />
              <Link href={`${basePath}/${post.id}/edit`} className="text-sm underline hover:no-underline">
                Continue editing
              </Link>
              <button
                onClick={() => deletePost(post.id)}
                className="text-sm text-muted underline hover:no-underline"
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {posts.length === 0 ? (
        <p className="border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
          No drafts right now — anything you save without scheduling shows up here.
        </p>
      ) : null}
    </div>
  );
}
