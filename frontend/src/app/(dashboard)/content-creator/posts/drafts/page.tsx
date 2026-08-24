import Link from "next/link";
import DraftManagement from "@/components/dashboard/content/DraftManagement";

export default function DraftManagementPage() {
  return (
    <div>
      <Link href="/content-creator/posts" className="mb-4 inline-block text-sm underline hover:no-underline">
        &larr; All posts
      </Link>
      <h2 className="mb-4 font-display text-xl font-bold">Drafts</h2>
      <DraftManagement basePath="/content-creator/posts" />
    </div>
  );
}
