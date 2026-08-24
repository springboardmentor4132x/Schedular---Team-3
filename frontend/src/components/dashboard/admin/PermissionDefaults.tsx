"use client";

import { usePlatformSettingsStore, type RolePermissions } from "@/store/usePlatformSettingsStore";
import { ROLE_LABELS } from "@/lib/validation";

const ROLES = ["business_owner", "marketing_team", "content_creator"] as const;

const PERMISSION_LABELS: Record<keyof RolePermissions, string> = {
  canConnectAccounts: "Connect social accounts",
  canCreateCampaigns: "Create campaigns",
  canPublishWithoutApproval: "Publish without approval",
  canInviteTeamMembers: "Invite team members",
  canViewAnalytics: "View analytics",
};

const PERMISSION_KEYS = Object.keys(PERMISSION_LABELS) as (keyof RolePermissions)[];

export default function PermissionDefaults() {
  const { permissions, togglePermission } = usePlatformSettingsStore();

  return (
    <div className="overflow-x-auto border border-border bg-surface">
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead>
          <tr className="border-b border-border font-mono text-[11px] text-muted">
            <th className="px-5 py-3">Capability</th>
            {ROLES.map((role) => (
              <th key={role} className="px-5 py-3 text-center">
                {ROLE_LABELS[role]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERMISSION_KEYS.map((key) => (
            <tr key={key} className="border-b border-border last:border-0">
              <td className="px-5 py-4">{PERMISSION_LABELS[key]}</td>
              {ROLES.map((role) => (
                <td key={role} className="px-5 py-4 text-center">
                  <button
                    onClick={() => togglePermission(role, key)}
                    className={`inline-flex h-6 w-6 items-center justify-center border ${
                      permissions[role][key] ? "border-ink bg-ink text-background" : "border-border text-muted"
                    }`}
                  >
                    {permissions[role][key] ? "✓" : ""}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-border px-5 py-3 text-xs text-muted">
        Administrator always has full access and isn&apos;t shown here.
      </p>
    </div>
  );
}
