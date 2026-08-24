import type { ReactNode } from "react";
import DashboardShell from "@/components/dashboard/layout/DashboardShell";

export default function ContentCreatorLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell navKey="content-creator" basePath="/content-creator" title="Content Creator Dashboard">
      {children}
    </DashboardShell>
  );
}
