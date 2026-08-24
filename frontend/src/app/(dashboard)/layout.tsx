import type { ReactNode } from "react";
import RequireAuth from "@/components/dashboard/RequireAuth";

// Each role subfolder renders its own DashboardShell (different sidebar per
// role) — this top-level layout only owns the auth/role guard shared by all
// of them.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
