import { create } from "zustand";
import type { Role } from "@/lib/validation";

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "suspended";
  joinedAt: string;
  lastActive: string;
  connectedAccounts: number;
}

const INITIAL_USERS: AdminUserRecord[] = [
  { id: "u1", name: "You", email: "admin@gmail.com", role: "administrator", status: "active", joinedAt: "2026-01-04", lastActive: "Just now", connectedAccounts: 0 },
  { id: "u2", name: "Nike Marketing Co.", email: "nike.ops@gmail.com", role: "business_owner", status: "active", joinedAt: "2026-02-11", lastActive: "2h ago", connectedAccounts: 4 },
  { id: "u3", name: "Samsung India", email: "samsung.social@gmail.com", role: "business_owner", status: "active", joinedAt: "2026-02-18", lastActive: "1d ago", connectedAccounts: 3 },
  { id: "u4", name: "Swiggy", email: "swiggy.growth@gmail.com", role: "business_owner", status: "suspended", joinedAt: "2026-03-02", lastActive: "9d ago", connectedAccounts: 2 },
  { id: "u5", name: "Nova Digital", email: "team@gmail.com", role: "marketing_team", status: "active", joinedAt: "2026-01-20", lastActive: "30m ago", connectedAccounts: 0 },
  { id: "u6", name: "Brightpath Marketing", email: "hello.brightpath@gmail.com", role: "marketing_team", status: "active", joinedAt: "2026-02-05", lastActive: "3h ago", connectedAccounts: 0 },
  { id: "u7", name: "Fieldnote Agency", email: "fieldnote.team@gmail.com", role: "marketing_team", status: "active", joinedAt: "2026-03-10", lastActive: "5d ago", connectedAccounts: 0 },
  { id: "u8", name: "Priya Sharma", email: "priya.creates@gmail.com", role: "content_creator", status: "active", joinedAt: "2026-01-29", lastActive: "12m ago", connectedAccounts: 1 },
  { id: "u9", name: "Arjun Rao", email: "arjun.rao@gmail.com", role: "content_creator", status: "active", joinedAt: "2026-02-22", lastActive: "1h ago", connectedAccounts: 0 },
  { id: "u10", name: "Meera Iyer", email: "meera.iyer@gmail.com", role: "content_creator", status: "suspended", joinedAt: "2026-03-15", lastActive: "14d ago", connectedAccounts: 2 },
  { id: "u11", name: "Kabir Singh", email: "kabir.singh@gmail.com", role: "content_creator", status: "active", joinedAt: "2026-04-01", lastActive: "6h ago", connectedAccounts: 1 },
];

interface AdminUsersState {
  users: AdminUserRecord[];
  toggleStatus: (id: string) => void;
}

export const useAdminUsersStore = create<AdminUsersState>((set) => ({
  users: INITIAL_USERS,
  toggleStatus: (id) =>
    set((s) => ({
      users: s.users.map((u) =>
        u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u
      ),
    })),
}));
