import ContentDashboard from "@/components/dashboard/content/ContentDashboard";

export default async function ClientContentPage({
  params,
}: {
  params: Promise<{ businessOwnerId: string }>;
}) {
  const { businessOwnerId } = await params;
  return <ContentDashboard basePath={`/marketing-team/clients/${businessOwnerId}/content`} />;
}
