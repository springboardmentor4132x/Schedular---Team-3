import CampaignDetails from "@/components/dashboard/campaigns/CampaignDetails";

export default async function ClientCampaignDetailsPage({
  params,
}: {
  params: Promise<{ businessOwnerId: string; campaignId: string }>;
}) {
  const { campaignId } = await params;
  return <CampaignDetails campaignId={campaignId} />;
}