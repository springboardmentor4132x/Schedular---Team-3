import { create } from "zustand";
import type { Role } from "@/lib/validation";

export interface RolePermissions {
  canConnectAccounts: boolean;
  canCreateCampaigns: boolean;
  canPublishWithoutApproval: boolean;
  canInviteTeamMembers: boolean;
  canViewAnalytics: boolean;
}

const DEFAULT_PERMISSIONS: RolePermissions = {
  canConnectAccounts: true,
  canCreateCampaigns: true,
  canPublishWithoutApproval: true,
  canInviteTeamMembers: false,
  canViewAnalytics: true,
};

interface PlatformSettingsState {
  registrationOpen: boolean;
  requireEmailVerification: boolean;
  permissions: Record<Exclude<Role, "administrator">, RolePermissions>;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  passwordExpiryDays: number;
  requireTwoFactorForAdmins: boolean;

  toggleRegistrationOpen: () => void;
  toggleEmailVerification: () => void;
  togglePermission: (role: Exclude<Role, "administrator">, key: keyof RolePermissions) => void;
  updateSecurityPolicy: (patch: Partial<{
    sessionTimeoutMinutes: number;
    maxLoginAttempts: number;
    passwordExpiryDays: number;
  }>) => void;
  toggleTwoFactorRequirement: () => void;
}

export const usePlatformSettingsStore = create<PlatformSettingsState>((set) => ({
  registrationOpen: true,
  requireEmailVerification: false,
  permissions: {
    business_owner: { ...DEFAULT_PERMISSIONS, canCreateCampaigns: false },
    business_user: { ...DEFAULT_PERMISSIONS, canCreateCampaigns: false },
    marketing_team: { ...DEFAULT_PERMISSIONS, canInviteTeamMembers: true },
    content_creator: { ...DEFAULT_PERMISSIONS, canPublishWithoutApproval: false },
  },
  sessionTimeoutMinutes: 60,
  maxLoginAttempts: 5,
  passwordExpiryDays: 90,
  requireTwoFactorForAdmins: false,

  toggleRegistrationOpen: () => set((s) => ({ registrationOpen: !s.registrationOpen })),
  toggleEmailVerification: () => set((s) => ({ requireEmailVerification: !s.requireEmailVerification })),
  togglePermission: (role, key) =>
    set((s) => ({
      permissions: {
        ...s.permissions,
        [role]: { ...s.permissions[role], [key]: !s.permissions[role][key] },
      },
    })),
  updateSecurityPolicy: (patch) => set((s) => ({ ...s, ...patch })),
  toggleTwoFactorRequirement: () => set((s) => ({ requireTwoFactorForAdmins: !s.requireTwoFactorForAdmins })),
}));
