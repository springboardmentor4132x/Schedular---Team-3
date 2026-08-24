import { create } from "zustand";
import type { NotificationCategory, DeliveryChannel } from "@/lib/notifications";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  timestamp: string;
  read: boolean;
  readAt?: string;
  deliveryChannel: DeliveryChannel;
}

export interface TeamActivityItem {
  id: string;
  type:
    | "campaign_assigned"
    | "task_assigned"
    | "campaign_updated"
    | "content_review_requested"
    | "publishing_approval_requested"
    | "comment_added"
    | "task_completed";
  title: string;
  description: string;
  campaignName?: string;
  userName: string;
  timestamp: string;
}

export interface NotificationPreferences {
  publishing: boolean;
  campaigns: boolean;
  account: boolean;
  team: boolean;
  system: boolean;
}

export interface ChannelPreferences {
  in_app: boolean;
  email: boolean;
  push: boolean;
}

export type EmailFrequency = "immediate" | "daily" | "weekly";

const now = () => new Date().toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    title: "Publishing failed",
    description: "\"Customer spotlight: how Priya uses our app daily.\" failed on LinkedIn — rate limit exceeded.",
    category: "publishing",
    timestamp: hoursAgo(2),
    read: false,
    deliveryChannel: "in_app",
  },
  {
    id: "n2",
    title: "Post published successfully",
    description: "\"Weekend sale — 20% off everything, today only.\" went out to Facebook, Instagram, and Pinterest.",
    category: "publishing",
    timestamp: hoursAgo(5),
    read: false,
    deliveryChannel: "email",
  },
  {
    id: "n3",
    title: "Publishing reminder",
    description: "\"Behind the scenes from today's shoot\" is scheduled to publish in 30 minutes.",
    category: "publishing",
    timestamp: hoursAgo(1),
    read: false,
    deliveryChannel: "in_app",
  },
  {
    id: "n4",
    title: "Campaign reached 50% completion",
    description: "\"Summer Launch Push\" has published 14 of its planned posts.",
    category: "campaigns",
    timestamp: hoursAgo(8),
    read: false,
    deliveryChannel: "in_app",
  },
  {
    id: "n5",
    title: "Campaign deadline approaching",
    description: "\"Back to School\" ends in 3 days — 5 posts still in the queue.",
    category: "campaigns",
    timestamp: daysAgo(1),
    read: true,
    readAt: hoursAgo(20),
    deliveryChannel: "email",
  },
  {
    id: "n6",
    title: "Account requires reauthorization",
    description: "Your LinkedIn connection expired. Reconnect to keep publishing there.",
    category: "account",
    timestamp: daysAgo(1),
    read: false,
    deliveryChannel: "in_app",
  },
  {
    id: "n7",
    title: "New device login",
    description: "Your account was signed in from a new device in Mumbai, IN.",
    category: "account",
    timestamp: daysAgo(2),
    read: true,
    readAt: daysAgo(2),
    deliveryChannel: "email",
  },
  {
    id: "n8",
    title: "New client assigned",
    description: "Swiggy has selected your team to manage their social accounts.",
    category: "team",
    timestamp: daysAgo(3),
    read: true,
    readAt: daysAgo(3),
    deliveryChannel: "in_app",
  },
  {
    id: "n9",
    title: "Content approved",
    description: "Your draft \"Fall Collection Launch\" was approved and moved to the queue.",
    category: "team",
    timestamp: daysAgo(4),
    read: true,
    readAt: daysAgo(4),
    deliveryChannel: "in_app",
  },
  {
    id: "n10",
    title: "Scheduled maintenance",
    description: "SocialPilot will undergo brief maintenance on Sunday, 2 AM-3 AM IST.",
    category: "system",
    timestamp: daysAgo(5),
    read: true,
    readAt: daysAgo(5),
    deliveryChannel: "email",
  },
];

const INITIAL_TEAM_ACTIVITY: TeamActivityItem[] = [
  {
    id: "t1",
    type: "campaign_assigned",
    title: "Campaign assigned",
    description: "Nike Summer Sale was assigned to your team.",
    campaignName: "Nike Summer Sale",
    userName: "Nike Marketing Co.",
    timestamp: daysAgo(1),
  },
  {
    id: "t2",
    type: "content_review_requested",
    title: "Content submitted for review",
    description: "Priya Sharma submitted a draft for review.",
    campaignName: "Fall Collection Launch",
    userName: "Priya Sharma",
    timestamp: hoursAgo(6),
  },
  {
    id: "t3",
    type: "task_assigned",
    title: "Task assigned",
    description: "Arjun Rao was assigned 3 posts for the Back to School campaign.",
    campaignName: "Back to School",
    userName: "Arjun Rao",
    timestamp: hoursAgo(10),
  },
  {
    id: "t4",
    type: "comment_added",
    title: "New comment",
    description: "\"Can we swap this image for the new product shot?\"",
    campaignName: "Summer Launch Push",
    userName: "Kabir Singh",
    timestamp: daysAgo(2),
  },
  {
    id: "t5",
    type: "publishing_approval_requested",
    title: "Publishing approval requested",
    description: "A scheduled post for Samsung India is waiting on your approval.",
    campaignName: "Galaxy Reveal",
    userName: "Meera Iyer",
    timestamp: daysAgo(2),
  },
  {
    id: "t6",
    type: "task_completed",
    title: "Task completed",
    description: "Priya Sharma finished all assigned posts for this week.",
    campaignName: "Fall Collection Launch",
    userName: "Priya Sharma",
    timestamp: daysAgo(3),
  },
];

interface NotificationsState {
  notifications: NotificationItem[];
  teamActivity: TeamActivityItem[];
  preferences: NotificationPreferences;
  channels: ChannelPreferences;
  emailFrequency: EmailFrequency;
  promotionalEmails: boolean;

  markRead: (id: string) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  togglePreference: (key: keyof NotificationPreferences) => void;
  toggleChannel: (key: keyof ChannelPreferences) => void;
  setEmailFrequency: (freq: EmailFrequency) => void;
  togglePromotional: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: INITIAL_NOTIFICATIONS,
  teamActivity: INITIAL_TEAM_ACTIVITY,
  preferences: { publishing: true, campaigns: true, account: true, team: true, system: true },
  channels: { in_app: true, email: true, push: false },
  emailFrequency: "immediate",
  promotionalEmails: false,

  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true, readAt: now() } : n)),
    })),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.read ? n : { ...n, read: true, readAt: now() })),
    })),
  deleteNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
  togglePreference: (key) =>
    set((s) => ({ preferences: { ...s.preferences, [key]: !s.preferences[key] } })),
  toggleChannel: (key) => set((s) => ({ channels: { ...s.channels, [key]: !s.channels[key] } })),
  setEmailFrequency: (freq) => set({ emailFrequency: freq }),
  togglePromotional: () => set((s) => ({ promotionalEmails: !s.promotionalEmails })),
}));
