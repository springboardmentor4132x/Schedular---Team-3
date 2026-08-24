import CreatePostForm from "@/components/dashboard/content/CreatePostForm";

export default async function EditClientPostPage({
  params,
}: {
  params: Promise<{ businessOwnerId: string; postId: string }>;
}) {
  const { businessOwnerId, postId } = await params;
  return (
    <CreatePostForm postId={postId} backHref={`/marketing-team/clients/${businessOwnerId}/content`} />
  );
}
