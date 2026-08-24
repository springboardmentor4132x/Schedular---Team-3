"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trash2 } from "lucide-react";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { CATEGORY_META, CATEGORIES, type NotificationCategory } from "@/lib/notifications";

function timeAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function NotificationCenter() {
  const { notifications, markRead, markAllRead, deleteNotification } = useNotificationsStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<NotificationCategory | "all">("all");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const filtered = useMemo(() => {
    return notifications
      .filter((n) => (unreadOnly ? !n.read : true))
      .filter((n) => (category === "all" ? true : n.category === category))
      .filter(
        (n) =>
          n.title.toLowerCase().includes(query.toLowerCase()) ||
          n.description.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications, query, category, unreadOnly]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notifications…"
            className="w-full border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-accent-hover"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="accent-ink"
            />
            Unread only
          </label>
          {unreadCount > 0 ? (
            <button onClick={markAllRead} className="text-sm underline hover:no-underline">
              Mark all as read
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setCategory("all")}
          className={`relative border px-3 py-1.5 text-xs font-mono ${
            category === "all" ? "border-ink" : "border-border text-muted"
          }`}
        >
          {category === "all" ? (
            <motion.span
              layoutId="notif-category-active"
              className="absolute inset-0 bg-ink"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          ) : null}
          <span className={`relative z-10 ${category === "all" ? "text-background" : ""}`}>ALL</span>
        </motion.button>
        {CATEGORIES.map((c) => (
          <motion.button
            key={c}
            whileTap={{ scale: 0.96 }}
            onClick={() => setCategory(c)}
            className={`relative border px-3 py-1.5 text-xs font-mono ${
              category === c ? "border-ink" : "border-border text-muted"
            }`}
          >
            {category === c ? (
              <motion.span
                layoutId="notif-category-active"
                className="absolute inset-0 bg-ink"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            ) : null}
            <span className={`relative z-10 ${category === c ? "text-background" : ""}`}>
              {CATEGORY_META[c].label.toUpperCase()}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="mt-4 divide-y divide-border border border-border bg-surface">
        <AnimatePresence initial={false}>
          {filtered.map((n, i) => {
            const meta = CATEGORY_META[n.category];
            return (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
                className={`group flex items-start gap-3 px-5 py-4 ${n.read ? "" : "bg-accent-soft/20"}`}
              >
                <button onClick={() => markRead(n.id)} className="flex flex-1 items-start gap-3 text-left">
                  <meta.icon size={16} className="mt-0.5 shrink-0 text-ink" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{n.title}</p>
                      {!n.read ? <span className="h-1.5 w-1.5 shrink-0 bg-accent" /> : null}
                    </div>
                    <p className="mt-0.5 text-sm text-muted">{n.description}</p>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-muted">{timeAgo(n.timestamp)}</span>
                </button>
                <button
                  onClick={() => deleteNotification(n.id)}
                  title="Delete"
                  className="shrink-0 text-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                >
                  <Trash2 size={15} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">
            {unreadOnly ? "You're all caught up." : "Nothing matches this search."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
