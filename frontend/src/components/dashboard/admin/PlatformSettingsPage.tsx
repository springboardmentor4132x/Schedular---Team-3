"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, ShieldCheck, Lock } from "lucide-react";
import RegistrationRules from "./RegistrationRules";
import PermissionDefaults from "./PermissionDefaults";
import SecurityPolicy from "./SecurityPolicy";

const TABS = [
  { key: "registration", label: "Registration Rules", icon: UserPlus },
  { key: "permissions", label: "Permission Defaults", icon: ShieldCheck },
  { key: "security", label: "Security Policy", icon: Lock },
] as const;

export default function PlatformSettingsPage() {
  const [active, setActive] = useState<string>(TABS[0].key);

  return (
    <div>
      <p className="mb-6 max-w-lg text-sm text-muted">
        Platform-wide configuration. Your own login, password, and notification preferences
        live under Profile and Settings instead.
      </p>

      <div className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className="relative flex items-center gap-2 px-4 py-3 text-sm"
          >
            <tab.icon size={14} className={active === tab.key ? "text-ink" : "text-muted"} />
            <span className={active === tab.key ? "text-ink" : "text-muted"}>{tab.label}</span>
            {active === tab.key ? (
              <motion.span
                layoutId="platform-settings-tab-underline"
                className="absolute inset-x-0 -bottom-px h-[2px] bg-accent"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {active === "registration" ? <RegistrationRules /> : null}
            {active === "permissions" ? <PermissionDefaults /> : null}
            {active === "security" ? <SecurityPolicy /> : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
