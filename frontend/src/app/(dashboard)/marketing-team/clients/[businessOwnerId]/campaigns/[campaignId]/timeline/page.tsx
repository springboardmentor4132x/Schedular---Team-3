import CampaignTimeline from "@/components/dashboard/campaigns/CampaignTimeline";

export default async function ClientCampaignTimelinePage({
  params,
}: {
  params: Promise<{ businessOwnerId: string; campaignId: string }>;
}) {
  const { campaignId } = await params;
  return <CampaignTimeline campaignId={campaignId} />;
}