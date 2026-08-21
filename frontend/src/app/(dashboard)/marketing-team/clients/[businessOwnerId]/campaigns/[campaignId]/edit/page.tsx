import CampaignEditView from "@/components/dashboard/campaigns/CampaignEditView";

export default async function EditClientCampaignPage({
  params,
}: {
  params: Promise<{ businessOwnerId: string; campaignId: string }>;
}) {
  const { campaignId } = await params;
  return <CampaignEditView campaignId={campaignId} />;
}