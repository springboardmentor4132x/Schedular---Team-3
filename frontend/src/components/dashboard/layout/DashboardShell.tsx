"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import type { NavKey } from "@/lib/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardShell({
  navKey,
  basePath,
  title,
  children,
}: {
  navKey: NavKey;
  basePath: string;
  title: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar navKey={navKey} basePath={basePath} onLogout={handleLogout} />
      <div className="flex flex-1 flex-col">
        <Topbar navKey={navKey} basePath={basePath} fallbackTitle={title} />
        <main className="flex-1 bg-background p-6">{children}</main>
      </div>
    </div>
  );
}
