import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  FileText,
  Bell,
  UserCircle,
  Settings,
  FileEdit,
  CalendarDays,
  ShieldCheck,
  Building2,
  Link2,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

// Base path is prefixed by whichever shell renders this config — see
// components/dashboard/layout/Sidebar.tsx.

export const businessOwnerNav: NavItem[] = [
  { label: "Dashboard", href: "", icon: LayoutDashboard },
  { label: "Connected Accounts", href: "/accounts", icon: Link2 },
  { label: "Scheduled Posts", href: "/scheduled-posts", icon: CalendarClock },
  { label: "Published Posts", href: "/published-posts", icon: FileText },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile", icon: UserCircle },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const marketingTeamNav: NavItem[] = [
  { label: "Dashboard", href: "", icon: LayoutDashboard },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile", icon: UserCircle },
  { label: "Settings", href: "/settings", icon: Settings },
];

// Rendered once a Marketing Team member opens a specific client's workspace.
export const clientWorkspaceNav: NavItem[] = [
  { label: "Dashboard", href: "", icon: LayoutDashboard },
  { label: "Content Scheduling", href: "/content", icon: FileEdit },
  { label: "Publishing Calendar", href: "/calendar", icon: CalendarDays },
];

export const contentCreatorNav: NavItem[] = [
  { label: "Dashboard", href: "", icon: LayoutDashboard },
  { label: "Connected Accounts", href: "/accounts", icon: Link2 },
  { label: "My Posts", href: "/posts", icon: FileEdit },
  { label: "My Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile", icon: UserCircle },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const administratorNav: NavItem[] = [
  { label: "Dashboard", href: "", icon: LayoutDashboard },
  { label: "User Management", href: "/users", icon: Users },
  { label: "Team Management", href: "/teams", icon: Building2 },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Platform Settings", href: "/settings", icon: ShieldCheck },
  { label: "Account Settings", href: "/account-settings", icon: Settings },
  { label: "Profile", href: "/profile", icon: UserCircle },
];

// Server Components (layout.tsx files) can only pass PLAIN data across the
// boundary into Client Components — not component/function references like
// the icons above. So server layouts pass one of these plain string keys,
// and the actual array (with icons) gets resolved here, entirely inside
// client-side code (Sidebar.tsx has "use client"). Never pass a NavItem[]
// itself as a prop from a Server Component.
export const NAV_SECTIONS = {
  "business-owner": businessOwnerNav,
  "marketing-team": marketingTeamNav,
  "client-workspace": clientWorkspaceNav,
  "content-creator": contentCreatorNav,
  administrator: administratorNav,
} as const;

export type NavKey = keyof typeof NAV_SECTIONS;
