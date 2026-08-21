import CampaignAssignedPosts from "@/components/dashboard/campaigns/CampaignAssignedPosts";

export default async function ClientCampaignPostsPage({
  params,
}: {
  params: Promise<{ businessOwnerId: string; campaignId: string }>;
}) {
  const { campaignId } = await params;
  return <CampaignAssignedPosts campaignId={campaignId} />;
}
