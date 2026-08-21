import CampaignTimeline from "@/components/dashboard/campaigns/CampaignTimeline";

export default async function CampaignTimelinePage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  return <CampaignTimeline campaignId={campaignId} />;
}