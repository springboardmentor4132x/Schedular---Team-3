"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { usePlatformSettingsStore } from "@/store/usePlatformSettingsStore";
import ToggleSwitch from "@/components/dashboard/settings/ToggleSwitch";

export default function SecurityPolicy() {
  const { sessionTimeoutMinutes, maxLoginAttempts, passwordExpiryDays, requireTwoFactorForAdmins, updateSecurityPolicy, toggleTwoFactorRequirement } =
    usePlatformSettingsStore();

  const [timeout_, setTimeout_] = useState(sessionTimeoutMinutes);
  const [attempts, setAttempts] = useState(maxLoginAttempts);
  const [expiry, setExpiry] = useState(passwordExpiryDays);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    updateSecurityPolicy({
      sessionTimeoutMinutes: timeout_,
      maxLoginAttempts: attempts,
      passwordExpiryDays: expiry,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div className="space-y-6">
      <div className="border border-border bg-surface p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Session timeout</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={5}
                value={timeout_}
                onChange={(e) => setTimeout_(Number(e.target.value))}
                className="w-full border border-border bg-background px-3 py-2 text-sm outline-none"
              />
              <span className="text-xs text-muted">min</span>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Max login attempts</label>
            <input
              type="number"
              min={1}
              value={attempts}
              onChange={(e) => setAttempts(Number(e.target.value))}
              className="w-full border border-border bg-background px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Password expiry</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={expiry}
                onChange={(e) => setExpiry(Number(e.target.value))}
                className="w-full border border-border bg-background px-3 py-2 text-sm outline-none"
              />
              <span className="text-xs text-muted">days</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="bg-accent px-5 py-2.5 text-sm font-medium text-ink hover:bg-accent-hover"
          >
            Save policy
          </motion.button>
          <AnimatePresence>
            {saved ? (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-sm text-success"
              >
                <CheckCircle2 size={15} /> Saved
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <div className="border border-border bg-surface px-5">
        <ToggleSwitch
          checked={requireTwoFactorForAdmins}
          onChange={toggleTwoFactorRequirement}
          label="Require 2FA for Administrators"
          description="Enforce two-factor authentication on every admin account. (Preview — not backend-wired yet.)"
        />
      </div>
    </div>
  );
}
