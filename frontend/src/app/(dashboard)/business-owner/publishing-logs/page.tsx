import PublishingLogs from "@/components/dashboard/publishing/PublishingLogs";

export default function BusinessOwnerLogsPage() {
  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-bold">Publishing Logs</h2>
      <p className="mb-4 text-sm text-muted">
        Every publish attempt your Marketing Team has made on your connected accounts.
      </p>
      <PublishingLogs />
    </div>
  );
}
