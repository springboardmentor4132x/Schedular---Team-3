import CampaignEditView from "@/components/dashboard/campaigns/CampaignEditView";

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  return <CampaignEditView campaignId={campaignId} />;
}