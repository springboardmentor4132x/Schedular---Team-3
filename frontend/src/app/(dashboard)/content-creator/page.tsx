import { redirect } from "next/navigation";
import QuickActions from "@/components/dashboard/overview/QuickActions";
import ContentCreatorStats from "@/components/dashboard/overview/ContentCreatorStats";
import ConnectedPlatformsStrip from "@/components/dashboard/overview/ConnectedPlatformsStrip";
import CampaignsSnapshot from "@/components/dashboard/overview/CampaignsSnapshot";
import PostStatusBreakdown from "@/components/dashboard/overview/PostStatusBreakdown";
import { RecentPosts, UpcomingQueue } from "@/components/dashboard/overview/ActivityWidgets";

// Mocked until the backend is wired. hasWorkspace === false is what routes a
// brand-new solo creator into onboarding instead of an empty dashboard.
// workspaceType has no backing store yet either (no multi-tenant "who am I
// assigned to" data exists), so both stay as scenario flags — everything
// below them (drafts/scheduled/published/campaigns/reviews) now reads real
// data from the stores instead of hardcoded numbers.
const MOCK = {
  hasWorkspace: true,
  workspaceType: "own" as "own" | "assigned",
};

export default function ContentCreatorOverview() {
  if (!MOCK.hasWorkspace) {
    redirect("/content-creator/onboarding");
  }

  return (
    <div className="space-y-6">
      {MOCK.workspaceType === "own" ? (
        <div className="border border-border bg-surface px-4 py-3 text-sm text-muted">
          Working in your own workspace &mdash; no team assigned.
        </div>
      ) : null}

      <QuickActions
        actions={[
          { label: "New Post", href: "/content-creator/posts/new", icon: "FileEdit", primary: true },
          { label: "Connected Accounts", href: "/content-creator/accounts", icon: "Link2" },
        ]}
      />

      <ContentCreatorStats workspaceType={MOCK.workspaceType} />

      <ConnectedPlatformsStrip accountsHref="/content-creator/accounts" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <CampaignsSnapshot viewAllHref="/content-creator/campaigns" />
          <PostStatusBreakdown />
        </div>
        <div className="space-y-6">
          <RecentPosts editBasePath="/content-creator/posts" />
          <UpcomingQueue editBasePath="/content-creator/posts" />
        </div>
      </div>
    </div>
  );
}