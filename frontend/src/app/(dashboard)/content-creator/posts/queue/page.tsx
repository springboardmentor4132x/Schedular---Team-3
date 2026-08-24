import Link from "next/link";
import QueueManagement from "@/components/dashboard/content/QueueManagement";

export default function QueueManagementPage() {
  return (
    <div>
      <Link href="/content-creator/posts" className="mb-4 inline-block text-sm underline hover:no-underline">
        &larr; All posts
      </Link>
      <h2 className="mb-4 font-display text-xl font-bold">Queue</h2>
      <QueueManagement basePath="/content-creator/posts" />
    </div>
  );
}
