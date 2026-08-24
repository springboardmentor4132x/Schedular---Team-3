"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { NAV_SECTIONS, type NavKey } from "@/lib/navigation";
import { LogOut } from "lucide-react";
import Logo from "@/components/layout/Logo";
import { useNotificationsStore } from "@/store/useNotificationsStore";

export default function Sidebar({
  navKey,
  basePath,
  onLogout,
}: {
  navKey: NavKey;
  basePath: string;
  onLogout?: () => void;
}) {
  const pathname = usePathname();
  const items = NAV_SECTIONS[navKey];
  const unreadCount = useNotificationsStore((s) => s.notifications.filter((n) => !n.read).length);

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const href = `${basePath}${item.href}`;
          const isActive = pathname === href || (item.href !== "" && pathname.startsWith(href));
          return (
            <Link
              key={item.label}
              href={href}
              className={`relative flex items-center gap-3 px-3 py-2 text-sm ${
                isActive ? "" : "hover:bg-background"
              }`}
            >
              {isActive ? (
                <motion.span
                  layoutId={`sidebar-active-${navKey}`}
                  className="absolute inset-0 bg-ink"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              ) : null}
              <item.icon size={16} className={`relative z-10 ${isActive ? "text-background" : "text-ink"}`} />
              <span className={`relative z-10 ${isActive ? "text-background" : "text-ink"}`}>
                {item.label}
              </span>
              {item.label === "Notifications" && unreadCount > 0 ? (
                <span
                  className={`relative z-10 ml-auto flex h-4 min-w-4 items-center justify-center px-1 font-mono text-[10px] ${
                    isActive ? "bg-background text-ink" : "bg-accent text-ink"
                  }`}
                >
                  {unreadCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {onLogout ? (
        <button
          onClick={onLogout}
          className="flex items-center gap-3 border-t border-border px-6 py-4 text-sm text-muted hover:text-ink"
        >
          <LogOut size={16} />
          Logout
        </button>
      ) : null}
    </aside>
  );
}
