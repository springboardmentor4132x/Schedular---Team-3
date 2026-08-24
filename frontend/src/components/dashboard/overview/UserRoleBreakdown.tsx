"use client";

import { motion } from "framer-motion";
import { ROLE_LABELS, type Role } from "@/lib/validation";
import { useAdminUsersStore } from "@/store/useAdminUsersStore";

// Dashboard polish pass — compact role breakdown for the Administrator
// overview. Counts come straight from useAdminUsersStore, the same store
// that backs the full User Management page, so this can never drift out
// of sync with it.

const ROLE_ORDER: Role[] = ["business_owner", "marketing_team", "content_creator", "administrator"];

export default function UserRoleBreakdown() {
  const users = useAdminUsersStore((s) => s.users);
  const total = users.length;
  const rows = ROLE_ORDER.map((role) => ({
    role,
    count: users.filter((u) => u.role === role).length,
  })).filter((row) => row.count > 0);

  return (
    <div className="border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <p className="font-display font-bold">Users by role</p>
        <span className="font-mono text-xs text-muted">{total} total</span>
      </div>
      <div className="space-y-3 p-5">
        {rows.map(({ role, count }, i) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <motion.div
              key={role}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-muted">{ROLE_LABELS[role].toUpperCase()}</span>
                <span className="text-muted">{count}</span>
              </div>
              <div className="mt-1 h-1.5 w-full bg-background">
                <motion.div
                  className="h-1.5 bg-ink"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}