import { Link2 } from "lucide-react";
import Link from "next/link";

export default function ContentCreatorOnboarding() {
  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center border border-border bg-surface">
        <Link2 size={20} />
      </div>
      <h2 className="mt-5 font-display text-2xl font-bold">
        You&apos;re not working under a team yet
      </h2>
      <p className="mt-2 text-sm text-muted">
        No Marketing Team or Business Owner has added you to their workspace. That&apos;s
        fine — connect your own social accounts and manage your own content, solo.
      </p>
      <Link
        href="/content-creator/accounts"
        className="mt-6 inline-flex items-center gap-2 bg-accent px-5 py-3 font-medium text-ink hover:bg-accent-hover"
      >
        Connect your accounts
      </Link>
      <p className="mt-4 text-xs text-muted">
        If you&apos;re expecting an invite from a team, check back after they&apos;ve added you.
      </p>
    </div>
  );
}
