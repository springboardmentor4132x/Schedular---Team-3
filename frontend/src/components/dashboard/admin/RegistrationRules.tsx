"use client";

import { ShieldCheck } from "lucide-react";
import { usePlatformSettingsStore } from "@/store/usePlatformSettingsStore";
import ToggleSwitch from "@/components/dashboard/settings/ToggleSwitch";

export default function RegistrationRules() {
  const { registrationOpen, requireEmailVerification, toggleRegistrationOpen, toggleEmailVerification } =
    usePlatformSettingsStore();

  return (
    <div className="space-y-6">
      <div className="border border-border bg-surface px-5">
        <ToggleSwitch
          checked={registrationOpen}
          onChange={toggleRegistrationOpen}
          label="Allow new registrations"
          description="Turn off to freeze sign-ups platform-wide — existing users can still log in."
        />
        <ToggleSwitch
          checked={requireEmailVerification}
          onChange={toggleEmailVerification}
          label="Require email verification"
          description="New accounts must verify their Gmail address before their first login."
        />
      </div>

      <div className="flex items-start gap-2 border border-border bg-surface p-4 text-xs text-muted">
        <ShieldCheck size={14} className="mt-0.5 shrink-0" />
        <p>
          The one-Administrator rule is enforced automatically at registration and can&apos;t be
          changed here — the role dropdown hides Administrator the moment one exists.
        </p>
      </div>
    </div>
  );
}
