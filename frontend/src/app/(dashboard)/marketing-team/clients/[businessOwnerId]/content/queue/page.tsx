import QueueManagement from "@/components/dashboard/content/QueueManagement";

export default async function ClientQueuePage({
  params,
}: {
  params: Promise<{ businessOwnerId: string }>;
}) {
  const { businessOwnerId } = await params;
  return <QueueManagement basePath={`/marketing-team/clients/${businessOwnerId}/content`} />;
}
