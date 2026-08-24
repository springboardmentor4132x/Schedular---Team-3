import DraftManagement from "@/components/dashboard/content/DraftManagement";

export default async function ClientDraftsPage({
  params,
}: {
  params: Promise<{ businessOwnerId: string }>;
}) {
  const { businessOwnerId } = await params;
  return <DraftManagement basePath={`/marketing-team/clients/${businessOwnerId}/content`} />;
}
