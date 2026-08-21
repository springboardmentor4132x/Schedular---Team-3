import CampaignAssignedPosts from "@/components/dashboard/campaigns/CampaignAssignedPosts";

export default async function CampaignPostsPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  return <CampaignAssignedPosts campaignId={campaignId} />;
}
