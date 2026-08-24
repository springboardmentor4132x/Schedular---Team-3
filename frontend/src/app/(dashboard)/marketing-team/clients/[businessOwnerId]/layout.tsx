import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Sidebar from "@/components/dashboard/layout/Sidebar";
import Topbar from "@/components/dashboard/layout/Topbar";
import { getMockClient } from "@/lib/mockClients";

export default async function ClientWorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ businessOwnerId: string }>;
}) {
  const { businessOwnerId } = await params;
  const client = getMockClient(businessOwnerId);

  // Every nested page under this layout is scoped to businessOwnerId — this
  // is the structural enforcement of "a Marketing Team only sees clients
  // assigned to them." Swap getMockClient for a real backend call that also
  // verifies the assignment exists (403s otherwise) once the API is live.
  if (!client) notFound();

  return (
    <div className="flex min-h-screen">
      <Sidebar
        navKey="client-workspace"
        basePath={`/marketing-team/clients/${businessOwnerId}`}
      />
      <div className="flex flex-1 flex-col">
        <div className="border-b border-border">
          <Link
            href="/marketing-team/clients"
            className="flex items-center gap-2 px-6 py-2 text-xs text-muted hover:text-ink"
          >
            <ArrowLeft size={12} />
            All clients
          </Link>
        </div>
        <Topbar
          navKey="client-workspace"
          basePath={`/marketing-team/clients/${businessOwnerId}`}
          fallbackTitle={`${client.name} Workspace`}
        />
        <main className="flex-1 bg-background p-6">{children}</main>
      </div>
    </div>
  );
}
