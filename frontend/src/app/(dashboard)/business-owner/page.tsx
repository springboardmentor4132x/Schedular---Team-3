import QuickActions from "@/components/dashboard/overview/QuickActions";
import BusinessOwnerStats from "@/components/dashboard/overview/BusinessOwnerStats";
import ConnectedPlatformsStrip from "@/components/dashboard/overview/ConnectedPlatformsStrip";
import CampaignsSnapshot from "@/components/dashboard/overview/CampaignsSnapshot";
import PostStatusBreakdown from "@/components/dashboard/overview/PostStatusBreakdown";
import { RecentPosts, UpcomingQueue } from "@/components/dashboard/overview/ActivityWidgets";

export default function BusinessOwnerOverview() {
  return (
    <div className="space-y-6">
      <QuickActions
        actions={[
          { label: "Manage Accounts", href: "/business-owner/accounts", icon: "Users", primary: true },
          { label: "View Reports", href: "/business-owner/reports", icon: "FileText" },
        ]}
      />

      <BusinessOwnerStats />

      <ConnectedPlatformsStrip accountsHref="/business-owner/accounts" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <CampaignsSnapshot viewAllHref="/business-owner/campaigns" />
          <PostStatusBreakdown />
        </div>
        <div className="space-y-6">
          <RecentPosts readOnly />
          <UpcomingQueue readOnly />
        </div>
      </div>
    </div>
  );
}