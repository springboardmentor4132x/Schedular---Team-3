"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShieldOff, ShieldCheck, ArrowUpDown } from "lucide-react";
import { useAdminUsersStore } from "@/store/useAdminUsersStore";
import { ROLE_LABELS, ROLE_VALUES, type Role } from "@/lib/validation";
import StatCard from "@/components/dashboard/StatCard";

const ROLE_FILTERS: { value: Role | "all"; label: string }[] = [
  { value: "all", label: "All" },
  ...ROLE_VALUES.map((r) => ({ value: r, label: ROLE_LABELS[r] })),
];

type SortKey = "name" | "joinedAt" | "connectedAccounts";

function SortHeader({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 hover:text-ink">
      {label}
      <ArrowUpDown size={11} className={active ? "text-ink" : "text-muted"} />
    </button>
  );
}

export default function UserManagementPage() {
  const users = useAdminUsersStore((s) => s.users);
  const toggleStatus = useAdminUsersStore((s) => s.toggleStatus);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("joinedAt");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(1);
    }
  }

  const filtered = useMemo(() => {
    const list = users.filter((u) => {
      const matchesQuery =
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase());
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesQuery && matchesRole;
    });
    return [...list].sort((a, b) => {
      if (sortKey === "name") return sortDir * a.name.localeCompare(b.name);
      if (sortKey === "connectedAccounts") return sortDir * (a.connectedAccounts - b.connectedAccounts);
      return sortDir * (new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
    });
  }, [users, query, roleFilter, sortKey, sortDir]);

  const active = users.filter((u) => u.status === "active").length;
  const suspended = users.filter((u) => u.status === "suspended").length;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Users" value={users.length} />
        <StatCard label="Active" value={active} />
        <StatCard label="Suspended" value={suspended} />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email…"
            className="w-full border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-accent-hover"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {ROLE_FILTERS.map((f) => (
          <motion.button
            key={f.value}
            whileTap={{ scale: 0.96 }}
            onClick={() => setRoleFilter(f.value)}
            className={`relative border px-3 py-1.5 text-xs font-mono ${
              roleFilter === f.value ? "border-ink" : "border-border text-muted hover:text-ink"
            }`}
          >
            {roleFilter === f.value ? (
              <motion.span
                layoutId="user-role-filter-active"
                className="absolute inset-0 bg-ink"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            ) : null}
            <span className={`relative z-10 ${roleFilter === f.value ? "text-background" : ""}`}>
              {f.label.toUpperCase()}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="mt-6 border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border font-mono text-[11px] text-muted">
              <th className="px-6 py-4">
                <SortHeader label="Name" active={sortKey === "name"} onClick={() => toggleSort("name")} />
              </th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">
                <SortHeader label="Joined" active={sortKey === "joinedAt"} onClick={() => toggleSort("joinedAt")} />
              </th>
              <th className="px-6 py-4">Last Active</th>
              <th className="px-6 py-4">
                <SortHeader label="Accounts" active={sortKey === "connectedAccounts"} onClick={() => toggleSort("connectedAccounts")} />
              </th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {filtered.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-ink font-mono text-xs text-background">
                        {u.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{u.name}</p>
                        <p className="truncate text-xs text-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="border border-border px-2 py-1 font-mono text-[10px] text-muted">
                      {ROLE_LABELS[u.role].toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-mono text-[11px] ${u.status === "active" ? "text-success" : "text-danger"}`}>
                      {u.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-muted">{u.joinedAt}</td>
                  <td className="px-6 py-4 text-xs text-muted">{u.lastActive}</td>
                  <td className="px-6 py-4">{u.connectedAccounts}</td>
                  <td className="px-6 py-4">
                    {u.role !== "administrator" ? (
                      <button
                        onClick={() => toggleStatus(u.id)}
                        className="flex items-center gap-1 border border-ink/30 px-3 py-1.5 text-xs font-medium hover:bg-background"
                      >
                        {u.status === "active" ? <ShieldOff size={12} /> : <ShieldCheck size={12} />}
                        {u.status === "active" ? "Suspend" : "Activate"}
                      </button>
                    ) : null}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {filtered.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">No users match this search.</p>
        ) : null}
      </div>
    </div>
  );
}
