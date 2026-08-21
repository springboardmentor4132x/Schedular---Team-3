import CampaignDetails from "@/components/dashboard/campaigns/CampaignDetails";

export default async function CampaignDetailsPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  return <CampaignDetails campaignId={campaignId} />;
}