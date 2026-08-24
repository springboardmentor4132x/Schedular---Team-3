"use client";

import { useNotificationsStore } from "@/store/useNotificationsStore";
import { CATEGORY_META, CATEGORIES, CHANNEL_LABELS } from "@/lib/notifications";
import ToggleSwitch from "@/components/dashboard/settings/ToggleSwitch";

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  publishing: "Post scheduled, published, failed, cancelled, or rescheduled.",
  campaigns: "Campaign created, started, updated, completed, or nearing its deadline.",
  account: "Accounts connected/disconnected, tokens expiring, logins, password changes.",
  team: "Task and campaign assignments, content review, comments, team changes.",
  system: "Maintenance windows, product updates, and security alerts.",
};

export default function NotificationSettings() {
  const { preferences, channels, togglePreference, toggleChannel } = useNotificationsStore();

  return (
    <div className="space-y-8">
      <div className="border border-border bg-surface px-5">
        <p className="py-3 font-display font-bold">Notification categories</p>
        <div className="divide-y divide-border">
          {CATEGORIES.map((c) => {
            const meta = CATEGORY_META[c];
            return (
              <ToggleSwitch
                key={c}
                checked={preferences[c]}
                onChange={() => togglePreference(c)}
                label={meta.label}
                description={CATEGORY_DESCRIPTIONS[c]}
              />
            );
          })}
        </div>
      </div>

      <div className="border border-border bg-surface px-5">
        <p className="py-3 font-display font-bold">Delivery channels</p>
        <div className="divide-y divide-border">
          <ToggleSwitch
            checked={channels.in_app}
            onChange={() => toggleChannel("in_app")}
            label={CHANNEL_LABELS.in_app}
            description="Show notifications inside the app."
          />
          <ToggleSwitch
            checked={channels.email}
            onChange={() => toggleChannel("email")}
            label={CHANNEL_LABELS.email}
            description="Receive important updates by email."
          />
          <ToggleSwitch
            checked={channels.push}
            onChange={() => toggleChannel("push")}
            label={CHANNEL_LABELS.push}
            description="Mobile/PWA push notifications — not built yet, preview only."
          />
        </div>
      </div>
    </div>
  );
}
