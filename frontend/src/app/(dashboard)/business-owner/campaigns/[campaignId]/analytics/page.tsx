import CampaignAnalytics from "@/components/dashboard/campaigns/CampaignAnalytics";

export default async function CampaignAnalyticsPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  return <CampaignAnalytics campaignId={campaignId} />;
}