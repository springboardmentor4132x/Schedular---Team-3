"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ShieldCheck, AlertTriangle, Clock } from "lucide-react";
import type { SocialPlatform } from "@/lib/constants";
import { useAccountsStore } from "@/store/useAccountsStore";
import { PLATFORM_META } from "./platformMeta";

function timeAgo(iso?: string) {
  if (!iso) return null;
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function AccountCard({ platform }: { platform: SocialPlatform }) {
  const { connections, connect, reconnect, sync, disconnect } = useAccountsStore();
  const connection = connections[platform] || { platform, status: "not_connected" };
  const { label, Icon, color, availability, disabledReason } = PLATFORM_META[platform];
  const isPlatformDisabled = availability === "disabled";

  return (
    <motion.div
      layout
      className={`border border-border bg-surface p-8 ${isPlatformDisabled ? "opacity-75" : ""}`}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Icon size={32} color={color} />
          <div>
            <span className="font-display text-lg font-bold">{label}</span>
            {isPlatformDisabled && disabledReason && (
              <p className="font-mono text-[10px] text-muted">{disabledReason}</p>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isPlatformDisabled ? (
            <motion.span
              key="disabled"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 font-mono text-[11px] text-muted"
            >
              <Clock size={12} /> COMING SOON
            </motion.span>
          ) : connection.status === "connected" ? (
            <motion.span
              key="connected"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 font-mono text-[11px] text-success"
            >
              <ShieldCheck size={12} /> CONNECTED
            </motion.span>
          ) : connection.status === "expired" ? (
            <motion.span
              key="expired"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 font-mono text-[11px] text-danger"
            >
              <AlertTriangle size={12} /> NEEDS REAUTH
            </motion.span>
          ) : connection.status === "connecting" ? (
            <motion.span
              key="connecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 font-mono text-[11px] text-muted"
            >
              <RefreshCw size={12} className="animate-spin" /> CONNECTING
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {isPlatformDisabled ? (
          <motion.div
            key="disabled-body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="mt-4 text-sm text-muted">
              {label} integration is currently in progress and will be available soon.
            </p>
            <button
              disabled
              className="mt-5 cursor-not-allowed border border-border bg-background px-5 py-2.5 text-sm font-medium text-muted"
            >
              Unavailable
            </button>
          </motion.div>
        ) : connection.status === "connected" ? (
          <motion.div
            key="connected-body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {connection.handle && (
              <p className="mt-4 text-base text-muted">{connection.handle}</p>
            )}


            <div className="mt-4 flex items-center justify-between text-xs text-muted">
              <span>{connection.lastSyncedAt ? `Synced ${timeAgo(connection.lastSyncedAt)}` : "Connected"}</span>
              <div className="flex gap-3">
                <button onClick={() => sync(platform)} className="underline hover:no-underline">
                  Sync now
                </button>
                <button onClick={() => disconnect(platform)} className="underline hover:no-underline">
                  Disconnect
                </button>
              </div>
            </div>
          </motion.div>
        ) : connection.status === "expired" ? (
          <motion.div
            key="expired-body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="mt-3 text-sm text-muted">
              {connection.handle ? `${connection.handle} — ` : ""}access expired. Reconnect to keep publishing here.
            </p>
            <button
              onClick={() => reconnect(platform)}
              className="mt-5 border border-ink/30 px-5 py-2.5 text-sm font-medium hover:bg-background"
            >
              Reconnect
            </button>
          </motion.div>
        ) : connection.status === "connecting" ? (
          <motion.p
            key="connecting-body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-sm text-muted"
          >
            Redirecting to {label} to grant access&hellip;
          </motion.p>
        ) : (
          <motion.div
            key="not-connected-body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="mt-4 text-base text-muted">Not connected yet.</p>
            <button
              onClick={() => connect(platform)}
              className="mt-5 border border-ink/30 px-5 py-2.5 text-sm font-medium hover:bg-background"
            >
              Connect
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

