"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, History, SlidersHorizontal, Mail, Users } from "lucide-react";
import NotificationCenter from "./NotificationCenter";
import NotificationHistory from "./NotificationHistory";
import NotificationSettings from "./NotificationSettings";
import EmailPreferences from "./EmailPreferences";
import TeamActivityFeed from "./TeamActivityFeed";
import { useNotificationsStore } from "@/store/useNotificationsStore";

const BASE_TABS = [
  { key: "center", label: "Center", icon: Bell },
  { key: "history", label: "History", icon: History },
  { key: "settings", label: "Settings", icon: SlidersHorizontal },
  { key: "email", label: "Email", icon: Mail },
] as const;

const TEAM_ACTIVITY_TAB = { key: "team", label: "Team Activity", icon: Users } as const;

export default function NotificationsHub({ showTeamActivity = false }: { showTeamActivity?: boolean }) {
  const tabs = showTeamActivity ? [...BASE_TABS, TEAM_ACTIVITY_TAB] : BASE_TABS;
  const [active, setActive] = useState<string>(tabs[0].key);
  const unreadCount = useNotificationsStore((s) => s.notifications.filter((n) => !n.read).length);

  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className="relative flex items-center gap-2 px-4 py-3 text-sm"
          >
            <tab.icon size={14} className={active === tab.key ? "text-ink" : "text-muted"} />
            <span className={active === tab.key ? "text-ink" : "text-muted"}>{tab.label}</span>
            {tab.key === "center" && unreadCount > 0 ? (
              <span className="flex h-4 min-w-4 items-center justify-center bg-accent px-1 font-mono text-[10px] text-ink">
                {unreadCount}
              </span>
            ) : null}
            {active === tab.key ? (
              <motion.span
                layoutId="notif-hub-tab-underline"
                className="absolute inset-x-0 -bottom-px h-[2px] bg-accent"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {active === "center" ? <NotificationCenter /> : null}
            {active === "history" ? <NotificationHistory /> : null}
            {active === "settings" ? <NotificationSettings /> : null}
            {active === "email" ? <EmailPreferences /> : null}
            {active === "team" ? <TeamActivityFeed /> : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
