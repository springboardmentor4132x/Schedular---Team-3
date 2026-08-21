import CampaignForm from "@/components/dashboard/campaigns/CampaignForm";

export default function CreateCampaignPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold">Create Campaign</h1>
        <p className="mt-1 text-sm text-muted">
          Set up a new campaign with its budget, schedule, and objectives.
        </p>
      </div>
      <CampaignForm />
    </div>
  );
}