"use client";

import StatCard from "@/components/dashboard/StatCard";
import { useCampaignsStore } from "@/store/useCampaignsStore";
import { usePostsStore } from "@/store/usePostsStore";
import { useProfileStore } from "@/store/useProfileStore";

// Dashboard polish pass — replaces the page's old hardcoded MOCK stat
// values with real counts from the stores those numbers actually describe.
// Mirrors MarketingTeamSettings.tsx's AVAILABLE_TEAMS list (kept local
// there, so duplicated here rather than reaching into an unrelated
// settings component) purely to resolve the id already stored in
// useProfileStore into a display name.
const AVAILABLE_TEAMS: Record<string, string> = {
  "team-1": "Nova Digital",
  "team-2": "Brightpath Marketing",
  "team-3": "Fieldnote Agency",
};

export default function BusinessOwnerStats() {
  const campaigns = useCampaignsStore((s) => s.campaigns);
  const posts = usePostsStore((s) => s.posts);
  const marketingTeamId = useProfileStore((s) => s.marketingTeamId);

  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const scheduledPosts = posts.filter((p) => p.status === "scheduled").length;
  const publishedPosts = posts.filter((p) => p.status === "published").length;
  const teamName = marketingTeamId ? AVAILABLE_TEAMS[marketingTeamId] : undefined;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard label="Total Campaigns" value={campaigns.length} />
      <StatCard label="Active Campaigns" value={activeCampaigns} />
      <StatCard label="Scheduled Posts" value={scheduledPosts} />
      <StatCard label="Published Posts" value={publishedPosts} />
      <StatCard
        label="Marketing Team"
        value={teamName ?? "Not assigned"}
        hint={teamName ? undefined : "Choose one in Settings"}
      />
    </div>
  );
}