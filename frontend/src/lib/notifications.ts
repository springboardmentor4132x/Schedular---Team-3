import {
  Send,
  Megaphone,
  Link2,
  Users,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";

export type NotificationCategory = "publishing" | "campaigns" | "account" | "team" | "system";
export type DeliveryChannel = "in_app" | "email" | "push";

export const CATEGORY_META: Record<NotificationCategory, { label: string; icon: LucideIcon }> = {
  publishing: { label: "Publishing", icon: Send },
  campaigns: { label: "Campaigns", icon: Megaphone },
  account: { label: "Account Activity", icon: Link2 },
  team: { label: "Team Collaboration", icon: Users },
  system: { label: "System", icon: ShieldAlert },
};

export const CATEGORIES: NotificationCategory[] = ["publishing", "campaigns", "account", "team", "system"];

export const CHANNEL_LABELS: Record<DeliveryChannel, string> = {
  in_app: "In-App",
  email: "Email",
  push: "Push (coming soon)",
};
