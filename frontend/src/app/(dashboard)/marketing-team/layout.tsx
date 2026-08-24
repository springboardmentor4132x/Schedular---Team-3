"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import DashboardShell from "@/components/dashboard/layout/DashboardShell";

// Once inside a specific client's workspace (/marketing-team/clients/nike/...),
// clients/[businessOwnerId]/layout.tsx renders its own complete shell
// (sidebar + topbar). If this layout also wrapped it in a shell, both would
// stack — that was the "2 sidebars" bug. So this layout only applies the
// Marketing Team shell to routes OUTSIDE a specific client workspace.
export default function MarketingTeamLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const inClientWorkspace = /^\/marketing-team\/clients\/[^/]+/.test(pathname);

  if (inClientWorkspace) return <>{children}</>;

  return (
    <DashboardShell navKey="marketing-team" basePath="/marketing-team" title="Marketing Dashboard">
      {children}
    </DashboardShell>
  );
}
