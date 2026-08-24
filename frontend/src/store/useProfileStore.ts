import { create } from "zustand";

export interface NotificationPrefs {
  postPublished: boolean;
  postFailed: boolean;
  campaignUpdates: boolean;
  weeklyDigest: boolean;
}

interface ProfileState {
  avatarUrl: string | null;
  bio: string;
  organisation: string;
  organization: string;
  phone: string;
  designation: string;
  timezone: string;
  language: string;
  twoFactorEnabled: boolean;
  notifications: NotificationPrefs;
  marketingTeamId: string | null;
  setAvatar: (url: string | null) => void;
  updateProfile: (patch: {
    bio?: string;
    organisation?: string;
    organization?: string;
    phone?: string;
    designation?: string;
  }) => void;
  updatePreferences: (patch: { timezone?: string; language?: string }) => void;
  toggleTwoFactor: () => void;
  toggleNotification: (key: keyof NotificationPrefs) => void;
  setMarketingTeam: (id: string | null) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  avatarUrl: null,
  bio: "",
  organisation: "",
  organization: "",
  phone: "",
  designation: "",
  timezone: "Asia/Kolkata",
  language: "English",
  twoFactorEnabled: false,
  notifications: {
    postPublished: true,
    postFailed: true,
    campaignUpdates: true,
    weeklyDigest: false,
  },
  marketingTeamId: null,

  setAvatar: (url) => set({ avatarUrl: url }),
  updateProfile: (patch) =>
    set((s) => ({
      ...s,
      ...patch,
      organization: patch.organization ?? patch.organisation ?? s.organization,
      organisation: patch.organisation ?? patch.organization ?? s.organisation,
    })),
  updatePreferences: (patch) => set((s) => ({ ...s, ...patch })),
  toggleTwoFactor: () => set((s) => ({ twoFactorEnabled: !s.twoFactorEnabled })),
  toggleNotification: (key) =>
    set((s) => ({ notifications: { ...s.notifications, [key]: !s.notifications[key] } })),
  setMarketingTeam: (id) => set({ marketingTeamId: id }),
}));
