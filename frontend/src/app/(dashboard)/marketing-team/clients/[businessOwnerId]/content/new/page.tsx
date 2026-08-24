import CreatePostForm from "@/components/dashboard/content/CreatePostForm";

export default async function NewClientPostPage({
  params,
}: {
  params: Promise<{ businessOwnerId: string }>;
}) {
  const { businessOwnerId } = await params;
  return <CreatePostForm backHref={`/marketing-team/clients/${businessOwnerId}/content`} />;
}
