"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAccountsStore } from "@/store/useAccountsStore";
import { PLATFORM_META } from "@/components/dashboard/accounts/platformMeta";
import { SOCIAL_PLATFORMS } from "@/lib/constants";

export default function ConnectedPlatformsStrip({ accountsHref }: { accountsHref: string }) {
  const connections = useAccountsStore((s) => s.connections);
  const connectedCount = SOCIAL_PLATFORMS.filter((p) => connections[p].status === "connected").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between border border-border bg-surface p-5"
    >
      <div>
        <p className="font-mono text-xs text-muted">CONNECTED ACCOUNTS</p>
        <div className="mt-2 flex items-center gap-2">
          {SOCIAL_PLATFORMS.map((p) => {
            const meta = PLATFORM_META[p];
            const isConnected = connections[p].status === "connected";
            const isExpired = connections[p].status === "expired";
            return (
              <span
                key={p}
                className={`flex h-8 w-8 items-center justify-center border ${
                  isConnected ? "border-success" : isExpired ? "border-danger" : "border-border opacity-40"
                }`}
                title={`${meta.label}: ${connections[p].status.replace("_", " ")}`}
              >
                <meta.Icon size={15} color={isConnected || isExpired ? meta.color : undefined} />
              </span>
            );
          })}
          <span className="ml-2 text-sm text-muted">
            {connectedCount} of {SOCIAL_PLATFORMS.length} connected
          </span>
        </div>
      </div>
      <Link
        href={accountsHref}
        className="border border-ink/30 px-4 py-2 text-sm font-medium hover:bg-background"
      >
        Manage
      </Link>
    </motion.div>
  );
}
