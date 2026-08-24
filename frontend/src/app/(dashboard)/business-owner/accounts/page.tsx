import ConnectAccountGrid from "@/components/dashboard/accounts/ConnectAccountGrid";

export default function BusinessOwnerAccountsPage() {
  return (
    <div>
      <p className="mb-6 max-w-lg text-sm text-muted">
        Connect the accounts you want your Marketing Team to publish to. We never see or
        store your platform passwords &mdash; only the connection itself.
      </p>
      <ConnectAccountGrid />
    </div>
  );
}
