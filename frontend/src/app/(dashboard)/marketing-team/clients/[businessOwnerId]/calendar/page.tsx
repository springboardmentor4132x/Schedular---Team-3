import PublishingCalendar from "@/components/dashboard/content/PublishingCalendar";

export default async function ClientCalendarPage({
  params,
}: {
  params: Promise<{ businessOwnerId: string }>;
}) {
  const { businessOwnerId } = await params;
  return <PublishingCalendar basePath={`/marketing-team/clients/${businessOwnerId}/content`} />;
}
