"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

// /dashboard is the generic post-login landing spot — it immediately routes
// each role to its own workspace. Keeping this as a router (rather than one
// shared dashboard page) means each role's UI can diverge freely later
// without fighting over one file.
const ROLE_ROUTE: Record<string, string> = {
  administrator: "/administrator",
  business_owner: "/business-owner",
  marketing_team: "/marketing-team",
  content_creator: "/content-creator",
};

export default function DashboardRouter() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const target = user?.role ? ROLE_ROUTE[user.role] : null;
    router.replace(target ?? "/login");
  }, [user, router]);

  return (
    <div className="p-8">
      <p className="text-muted">Taking you to your workspace…</p>
    </div>
  );
}
