import type { ReactNode } from "react";
import DashboardShell from "@/components/dashboard/layout/DashboardShell";

export default function AdministratorLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell navKey="administrator" basePath="/administrator" title="Platform Overview">
      {children}
    </DashboardShell>
  );
}
