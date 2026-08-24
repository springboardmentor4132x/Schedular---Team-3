"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Zap, CalendarDays, CalendarRange } from "lucide-react";
import { useNotificationsStore, type EmailFrequency } from "@/store/useNotificationsStore";
import ToggleSwitch from "@/components/dashboard/settings/ToggleSwitch";

const FREQUENCIES: { value: EmailFrequency; label: string; description: string; icon: typeof Zap }[] = [
  { value: "immediate", label: "Immediately", description: "One email per event, as it happens.", icon: Zap },
  { value: "daily", label: "Daily summary", description: "One email each morning with the day before.", icon: CalendarDays },
  { value: "weekly", label: "Weekly summary", description: "One email every Monday with the week before.", icon: CalendarRange },
];

export default function EmailPreferences() {
  const { emailFrequency, setEmailFrequency, promotionalEmails, togglePromotional } = useNotificationsStore();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div className="space-y-6">
      <div className="border border-border bg-surface p-5">
        <p className="mb-4 font-display font-bold">How often should we email you?</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {FREQUENCIES.map((f) => {
            const active = emailFrequency === f.value;
            return (
              <motion.button
                key={f.value}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEmailFrequency(f.value)}
                className={`relative border p-4 text-left ${active ? "border-ink" : "border-border"}`}
              >
                {active ? (
                  <motion.span
                    layoutId="email-frequency-active"
                    className="absolute inset-0 bg-ink"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                ) : null}
                <div className="relative z-10">
                  <f.icon size={18} className={active ? "text-background" : "text-ink"} />
                  <p className={`mt-2 text-sm font-medium ${active ? "text-background" : ""}`}>{f.label}</p>
                  <p className={`mt-1 text-xs ${active ? "text-background/70" : "text-muted"}`}>{f.description}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="border border-border bg-surface px-5">
        <ToggleSwitch
          checked={promotionalEmails}
          onChange={togglePromotional}
          label="Promotional emails"
          description="Occasional tips, feature announcements, and offers. Optional."
        />
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className="bg-accent px-5 py-2.5 text-sm font-medium text-ink hover:bg-accent-hover"
        >
          Save preferences
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
  );
}
