"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Trash2, Ban, RefreshCw } from "lucide-react";
import { usePostsStore } from "@/store/usePostsStore";
import { PLATFORM_META } from "@/components/dashboard/accounts/platformMeta";
import type { SocialPlatform } from "@/lib/constants";
import type { PostStatus } from "@/types";
import { STATUS_META } from "@/lib/content";
import { useCampaignsStore } from "@/store/useCampaignsStore";
import StatusBadge from "./StatusBadge";
import PublishNowButton from "@/components/dashboard/publishing/PublishNowButton";

const FILTERS: { value: PostStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

type SortKey = "newest" | "oldest" | "caption";

export default function ContentDashboard({
  basePath,
  readOnly = false,
}: {
  basePath: string;
  readOnly?: boolean;
}) {
  const posts = usePostsStore((s) => s.posts);
  const fetchPosts = usePostsStore((s) => s.fetchPosts);
  const deletePost = usePostsStore((s) => s.deletePost);
  const cancelPost = usePostsStore((s) => s.cancelPost);
  const retryPublishing = usePostsStore((s) => s.retryPublishing);
  const campaigns = useCampaignsStore((s) => s.campaigns);
  const fetchCampaigns = useCampaignsStore((s) => s.fetchCampaigns);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PostStatus | "all">("all");
  const [sort, setSort] = useState<SortKey>("newest");

  // Fetch all posts from the server on mount so the list reflects real data.
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // MODULE 4 INTEGRATION: same reasoning as CreatePostForm.tsx — ensures the
  // campaign name lookup below has real data even on a fresh session.
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const filtered = useMemo(() => {
    let list = posts.filter((p) => p.caption.toLowerCase().includes(query.toLowerCase()));
    if (filter !== "all") list = list.filter((p) => p.status === filter);

    return [...list].sort((a, b) => {
      if (sort === "caption") return a.caption.localeCompare(b.caption);
      const aTime = new Date(a.updatedAt).getTime();
      const bTime = new Date(b.updatedAt).getTime();
      return sort === "newest" ? bTime - aTime : aTime - bTime;
    });
  }, [posts, query, filter, sort]);

  return (
    <div>
      {!readOnly ? (
        <div className="mb-4 flex gap-4 text-sm">
          <Link href={`${basePath}/drafts`} className="underline hover:no-underline">
            Drafts
          </Link>
          <Link href={`${basePath}/queue`} className="underline hover:no-underline">
            Queue
          </Link>
          <Link href={`${basePath}/logs`} className="underline hover:no-underline">
            Publishing Logs
          </Link>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search captions…"
            className="w-full border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-accent-hover"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="border border-border bg-surface px-3 py-2 text-sm outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="caption">Caption A–Z</option>
          </select>

          {!readOnly ? (
            <Link
              href={`${basePath}/new`}
              className="inline-flex items-center gap-2 bg-accent px-4 py-2 text-sm font-medium text-ink hover:bg-accent-hover"
            >
              <Plus size={16} />
              New Post
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <motion.button
            key={f.value}
            whileTap={{ scale: 0.96 }}
            onClick={() => setFilter(f.value)}
            className={`relative border px-3 py-1.5 text-xs font-mono ${
              filter === f.value ? "border-ink" : "border-border text-muted hover:text-ink"
            }`}
          >
            {filter === f.value ? (
              <motion.span
                layoutId="content-filter-active"
                className="absolute inset-0 bg-ink"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            ) : null}
            <span className={`relative z-10 ${filter === f.value ? "text-background" : ""}`}>
              {f.value === "all" ? "ALL" : STATUS_META[f.value as PostStatus].label.toUpperCase()}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="mt-6 divide-y divide-border border border-border bg-surface">
        <AnimatePresence initial={false}>
          {filtered.map((post, i) => (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
              className="group flex items-center justify-between gap-4 px-5 py-4 hover:bg-background"
            >
              <Link href={`${basePath}/${post.id}/edit`} className="min-w-0 flex-1">
                <p className="truncate text-sm">{post.caption}</p>
                <div className="mt-1.5 flex items-center gap-3">
                  <StatusBadge status={post.status} />
                  <span className="flex items-center gap-1">
                    {post.platforms.map((p) => {
                      const meta = PLATFORM_META[p as SocialPlatform];
                      return meta ? <meta.Icon key={p} size={13} color={meta.color} /> : null;
                    })}
                  </span>
                  {post.scheduledDate ? (
                    <span className="font-mono text-xs text-muted">
                      {post.scheduledDate} {post.scheduledTime}
                    </span>
                  ) : null}
                  {post.campaignId ? (
                    <span className="border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted">
                      {campaigns.find((c) => c.id === post.campaignId)?.name ?? "Campaign"}
                    </span>
                  ) : null}
                </div>
              </Link>

              {!readOnly ? (
                <div className="flex shrink-0 items-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                  {post.status === "draft" || post.status === "scheduled" ? (
                    <PublishNowButton post={post} variant="button" />
                  ) : null}
                  {post.status === "scheduled" ? (
                    <button
                      onClick={() => cancelPost(post.id)}
                      title="Cancel"
                      className="text-muted hover:text-danger"
                    >
                      <Ban size={16} />
                    </button>
                  ) : null}
                  {post.status === "failed" ? (
                    <button
                      onClick={() => retryPublishing(post.id)}
                      title="Retry publishing"
                      className="text-muted hover:text-ink"
                    >
                      <RefreshCw size={16} />
                    </button>
                  ) : null}
                  {post.status !== "published" ? (
                    <button
                      onClick={() => deletePost(post.id)}
                      title="Delete"
                      className="text-muted hover:text-danger"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : null}
                </div>
              ) : null}
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">
            {query ? `No posts match "${query}".` : "Nothing here yet."}
          </p>
        ) : null}
      </div>

      {readOnly ? (
        <p className="mt-3 text-xs text-muted">
          You&apos;re viewing this read-only — your Marketing Team creates and schedules posts on your behalf.
        </p>
      ) : null}
    </div>
  );
}
