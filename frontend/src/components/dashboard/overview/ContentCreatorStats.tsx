"use client";

import StatCard from "@/components/dashboard/StatCard";
import { usePostsStore } from "@/store/usePostsStore";
import { useCampaignsStore } from "@/store/useCampaignsStore";

// Dashboard polish pass — replaces the page's old hardcoded MOCK stat
// values with real counts from the stores those numbers actually describe.
export default function ContentCreatorStats({ workspaceType }: { workspaceType: "own" | "assigned" }) {
  const posts = usePostsStore((s) => s.posts);
  const campaigns = useCampaignsStore((s) => s.campaigns);

  const drafts = posts.filter((p) => p.status === "draft").length;
  const scheduledPosts = posts.filter((p) => p.status === "scheduled").length;
  const publishedPosts = posts.filter((p) => p.status === "published").length;
  const pendingReviews = posts.filter((p) => p.status === "pending_approval").length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard label="Drafts" value={drafts} />
      <StatCard label="Scheduled Posts" value={scheduledPosts} />
      <StatCard label="Published Posts" value={publishedPosts} />
      <StatCard label="Assigned Campaigns" value={campaigns.length} />
      <StatCard
        label="Pending Reviews"
        value={pendingReviews}
        hint={workspaceType === "own" ? "N/A — solo workspace" : undefined}
      />
    </div>
  );
}