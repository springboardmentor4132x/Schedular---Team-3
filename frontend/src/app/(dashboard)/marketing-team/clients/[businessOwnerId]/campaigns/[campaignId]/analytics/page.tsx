import CampaignAnalytics from "@/components/dashboard/campaigns/CampaignAnalytics";

export default async function ClientCampaignAnalyticsPage({
  params,
}: {
  params: Promise<{ businessOwnerId: string; campaignId: string }>;
}) {
  const { campaignId } = await params;
  return <CampaignAnalytics campaignId={campaignId} />;
}