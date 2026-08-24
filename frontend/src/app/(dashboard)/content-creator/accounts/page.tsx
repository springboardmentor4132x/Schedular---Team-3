import ConnectAccountGrid from "@/components/dashboard/accounts/ConnectAccountGrid";

export default function ContentCreatorAccountsPage() {
  return (
    <div>
      <p className="mb-6 max-w-lg text-sm text-muted">
        Connect your own accounts to post and schedule solo &mdash; no team required.
      </p>
      <ConnectAccountGrid />
    </div>
  );
}
