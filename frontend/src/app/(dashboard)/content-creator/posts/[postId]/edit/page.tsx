import CreatePostForm from "@/components/dashboard/content/CreatePostForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  return <CreatePostForm postId={postId} backHref="/content-creator/posts" />;
}
