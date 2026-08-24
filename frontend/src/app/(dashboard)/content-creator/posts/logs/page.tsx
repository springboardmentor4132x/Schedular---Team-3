import Link from "next/link";
import PublishingLogs from "@/components/dashboard/publishing/PublishingLogs";

export default function ContentCreatorLogsPage() {
  return (
    <div>
      <Link href="/content-creator/posts" className="mb-4 inline-block text-sm underline hover:no-underline">
        &larr; All posts
      </Link>
      <h2 className="mb-4 font-display text-xl font-bold">Publishing Logs</h2>
      <PublishingLogs />
    </div>
  );
}
