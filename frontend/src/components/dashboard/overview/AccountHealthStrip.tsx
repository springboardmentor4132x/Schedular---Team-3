"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { useAdminUsersStore } from "@/store/useAdminUsersStore";

// Dashboard polish pass — real active/suspended split from
// useAdminUsersStore. "System Status" has no backing store anywhere in the
// project (no health-check/monitoring data exists yet), so it stays a
// static operational label, same as before — just restyled to sit
// alongside the two real counts instead of in its own oversized card.
export default function AccountHealthStrip() {
  const users = useAdminUsersStore((s) => s.users);
  const active = users.filter((u) => u.status === "active").length;
  const suspended = users.filter((u) => u.status === "suspended").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center justify-between gap-4 border border-border bg-surface px-5 py-4"
    >
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-success" />
          <span className="text-sm">
            <span className="font-display font-bold">{active}</span>{" "}
            <span className="text-muted">active account{active === 1 ? "" : "s"}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldOff size={16} className="text-danger" />
          <span className="text-sm">
            <span className="font-display font-bold">{suspended}</span>{" "}
            <span className="text-muted">suspended account{suspended === 1 ? "" : "s"}</span>
          </span>
        </div>
      </div>
      <span className="flex items-center gap-1.5 font-mono text-xs text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        ALL SERVICES OPERATIONAL
      </span>
    </motion.div>
  );
}