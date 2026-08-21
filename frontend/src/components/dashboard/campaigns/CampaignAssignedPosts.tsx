"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, RefreshCw, Link2, Link2Off } from "lucide-react";
import { useCampaignsStore } from "@/store/useCampaignsStore";
import { usePostsStore } from "@/store/usePostsStore";
import CampaignStatusBadge from "./CampaignStatusBadge";
import StatusBadge from "@/components/dashboard/content/StatusBadge";

export default function CampaignAssignedPosts({ campaignId }: { campaignId: string }) {
  const { hasLoaded, isLoading, fetchCampaigns, getCampaignById } = useCampaignsStore();
  const posts = usePostsStore((s) => s.posts);
  const updatePost = usePostsStore((s) => s.updatePost);
  const pathname = usePathname();

  // Covers a direct link/refresh landing here before the dashboard has ever
  // populated the store. fetchCampaigns is idempotent (see its own guard).
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // This page lives at .../campaigns/[campaignId]/posts — stripping both
  // trailing segments gets back to the list; stripping just /posts gets
  // back to Details.
  const listHref = pathname.slice(0, pathname.length - `/${campaignId}/posts`.length);
  const detailsHref = pathname.slice(0, pathname.length - "/posts".length);

  if (isLoading || !hasLoaded) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border bg-surface p-16 text-center">
        <RefreshCw size={20} className="animate-spin text-muted" />
        <p className="text-sm text-muted">Loading campaign…</p>
      </div>
    );
  }

  const campaign = getCampaignById(campaignId);

  if (!campaign) {
    return (
      <div className="flex flex-col items-center gap-3 border border-dashed border-border bg-surface p-16 text-center">
        <h1 className="font-display text-lg font-bold">Campaign not found</h1>
        <p className="max-w-sm text-sm text-muted">
          This campaign may have been deleted, or the link is out of date.
        </p>
        <Link
          href={listHref}
          className="mt-2 inline-flex items-center gap-2 bg-accent px-5 py-2.5 text-sm font-medium text-ink hover:bg-accent-hover">
          <ArrowLeft size={14} />
          Back to Campaign Dashboard
        </Link>
      </div>
    );
  }

  // Reusing Post.campaignId and usePostsStore.updatePost() exactly as they
  // already exist — no store or type changes needed for either direction.
  const assignedPosts = posts.filter((p) => p.campaignId === campaign.id);
  const availablePosts = posts.filter((p) => !p.campaignId);

  function handleAssign(postId: string) {
    updatePost(postId, { campaignId: campaign!.id });
  }

  function handleUnassign(postId: string) {
    updatePost(postId, { campaignId: undefined });
  }

  return (
    <div className="space-y-6">
      <Link
        href={detailsHref}
        className="flex w-fit items-center gap-1.5 text-xs text-muted hover:text-ink">
        <ArrowLeft size={12} />
        Back to Campaign Details
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-xl font-bold">{campaign.name}</h1>
          <CampaignStatusBadge status={campaign.status} />
        </div>
        <p className="mt-1 text-sm text-muted">Assign Posts to Campaign</p>
      </div>

      <div className="border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold">Assigned Posts</h2>
          <span className="font-mono text-xs text-muted">{assignedPosts.length} assigned</span>
        </div>

        {assignedPosts.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No posts are assigned to this campaign yet.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {assignedPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between gap-4 border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{post.caption}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <StatusBadge status={post.status} />
                    <span className="font-mono text-[10px] uppercase text-muted">
                      {post.contentType}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleUnassign(post.id)}
                  className="flex shrink-0 items-center gap-1.5 border border-ink/30 px-3 py-2 text-xs font-medium text-muted hover:border-red-300 hover:bg-red-50 hover:text-red-600">
                  <Link2Off size={13} />
                  Unassign
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold">Available Posts</h2>
          <span className="font-mono text-xs text-muted">{availablePosts.length} unassigned</span>
        </div>
        <p className="mt-1 text-xs text-muted">
          Posts not currently linked to any campaign. Assign one to add it to this campaign.
        </p>

        {availablePosts.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            Every post is already assigned to a campaign, or there are no posts yet.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {availablePosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between gap-4 border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{post.caption}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <StatusBadge status={post.status} />
                    <span className="font-mono text-[10px] uppercase text-muted">
                      {post.contentType}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleAssign(post.id)}
                  className="flex shrink-0 items-center gap-1.5 bg-accent px-3 py-2 text-xs font-medium text-ink hover:bg-accent-hover">
                  <Link2 size={13} />
                  Assign
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
