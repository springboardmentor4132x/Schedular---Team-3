import type { ReactNode } from "react";
import DashboardShell from "@/components/dashboard/layout/DashboardShell";

export default function BusinessOwnerLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell navKey="business-owner" basePath="/business-owner" title="Business Dashboard">
      {children}
    </DashboardShell>
  );
}
