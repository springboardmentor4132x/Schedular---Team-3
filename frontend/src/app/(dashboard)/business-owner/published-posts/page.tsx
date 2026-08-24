"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePostsStore } from "@/store/usePostsStore";
import StatusBadge from "@/components/dashboard/content/StatusBadge";
import { PLATFORM_META } from "@/components/dashboard/accounts/platformMeta";
import type { SocialPlatform } from "@/lib/constants";

export default function BusinessOwnerPublishedPostsPage() {
  const posts = usePostsStore((s) => s.posts).filter((p) => p.status === "published");
  const fetchPosts = usePostsStore((s) => s.fetchPosts);

  useEffect(() => {
    fetchPosts({ status: "published" });
  }, [fetchPosts]);

  return (
    <div>
      <Link href="/business-owner/publishing-logs" className="mb-4 inline-block text-sm underline hover:no-underline">
        View publishing logs &rarr;
      </Link>
      <div className="divide-y divide-border border border-border bg-surface">
      {posts.map((post) => (
        <div key={post.id} className="px-5 py-4">
          <p className="text-sm">{post.caption}</p>
          <div className="mt-1.5 flex items-center gap-3">
            <StatusBadge status={post.status} />
            <span className="flex gap-1">
              {post.platforms.map((p) => {
                const meta = PLATFORM_META[p as SocialPlatform];
                return meta ? <meta.Icon key={p} size={13} color={meta.color} /> : null;
              })}
            </span>
            <span className="font-mono text-xs text-muted">{post.scheduledDate}</span>
          </div>
        </div>
      ))}
      {posts.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted">Nothing published yet.</p>
      ) : null}
      </div>
    </div>
  );
}
