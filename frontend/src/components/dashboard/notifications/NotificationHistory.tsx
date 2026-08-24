"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Trash2 } from "lucide-react";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { CATEGORY_META, CATEGORIES, CHANNEL_LABELS, type NotificationCategory } from "@/lib/notifications";

const DATE_RANGES = ["All time", "Last 7 days", "Last 30 days"] as const;

export default function NotificationHistory() {
  const { notifications, deleteNotification } = useNotificationsStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<NotificationCategory | "all">("all");
  const [status, setStatus] = useState<"all" | "read" | "unread">("all");
  const [range, setRange] = useState<(typeof DATE_RANGES)[number]>("All time");

  // eslint-disable-next-line react-hooks/purity, react-hooks/exhaustive-deps -- one-time wall-clock read for display filtering, not reactive to the clock
  const now = useMemo(() => Date.now(), []);

  const filtered = useMemo(() => {
    const cutoff =
      range === "Last 7 days" ? now - 7 * 86_400_000 : range === "Last 30 days" ? now - 30 * 86_400_000 : 0;

    return notifications
      .filter((n) => new Date(n.timestamp).getTime() >= cutoff)
      .filter((n) => (category === "all" ? true : n.category === category))
      .filter((n) => (status === "all" ? true : status === "read" ? n.read : !n.read))
      .filter(
        (n) =>
          n.title.toLowerCase().includes(query.toLowerCase()) ||
          n.description.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications, query, category, status, range, now]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search history…"
            className="w-full border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-accent-hover"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="border border-border bg-surface px-3 py-2 text-xs outline-none"
          >
            <option value="all">All statuses</option>
            <option value="read">Read</option>
            <option value="unread">Unread</option>
          </select>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as typeof range)}
            className="border border-border bg-surface px-3 py-2 text-xs outline-none"
          >
            {DATE_RANGES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["all", ...CATEGORIES] as const).map((c) => (
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
                layoutId="notif-history-category-active"
                className="absolute inset-0 bg-ink"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            ) : null}
            <span className={`relative z-10 ${category === c ? "text-background" : ""}`}>
              {c === "all" ? "ALL" : CATEGORY_META[c].label.toUpperCase()}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto border border-border bg-surface">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border font-mono text-[11px] text-muted">
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Generated</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Delivery</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((n) => {
              const meta = CATEGORY_META[n.category];
              return (
                <tr key={n.id} className="border-b border-border last:border-0">
                  <td className="max-w-[260px] px-6 py-4">
                    <p className="truncate font-medium">{n.title}</p>
                    <p className="truncate text-xs text-muted">{n.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-xs text-muted">
                      <meta.icon size={13} />
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-muted">
                    {new Date(n.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-mono text-[11px] ${n.read ? "text-muted" : "text-info"}`}>
                      {n.read ? "READ" : "UNREAD"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted">{CHANNEL_LABELS[n.deliveryChannel]}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => deleteNotification(n.id)}
                      title="Delete"
                      className="text-muted hover:text-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-muted">
                  No notifications match these filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
