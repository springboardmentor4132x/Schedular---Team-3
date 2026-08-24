"use client";

import StatCard from "@/components/dashboard/StatCard";
import { useAdminUsersStore } from "@/store/useAdminUsersStore";

// Dashboard polish pass — replaces the page's old hardcoded MOCK stat
// values with real counts from useAdminUsersStore, the same store that
// backs the full User Management page — these numbers can't drift out of
// sync with it.
export default function AdministratorStats() {
  const users = useAdminUsersStore((s) => s.users);

  const businessOwners = users.filter((u) => u.role === "business_owner").length;
  const marketingTeams = users.filter((u) => u.role === "marketing_team").length;
  const contentCreators = users.filter((u) => u.role === "content_creator").length;
  const connectedAccounts = users.reduce((sum, u) => sum + u.connectedAccounts, 0);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard label="Total Users" value={users.length} />
      <StatCard label="Business Owners" value={businessOwners} />
      <StatCard label="Marketing Teams" value={marketingTeams} />
      <StatCard label="Content Creators" value={contentCreators} />
      <StatCard
        label="Connected Accounts"
        value={connectedAccounts}
        hint="Across all Business Owners & solo Content Creators"
      />
    </div>
  );
}