"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Users } from "lucide-react";
import { useProfileStore } from "@/store/useProfileStore";

// Placeholder agencies to choose from — stands in for a real directory of
// Marketing Team accounts once the backend can list them.
const AVAILABLE_TEAMS = [
  { id: "team-1", name: "Nova Digital" },
  { id: "team-2", name: "Brightpath Marketing" },
  { id: "team-3", name: "Fieldnote Agency" },
];

export default function MarketingTeamSettings() {
  const { marketingTeamId, setMarketingTeam } = useProfileStore();
  const [selected, setSelected] = useState(marketingTeamId ?? "");
  const [saved, setSaved] = useState(false);

  const current = AVAILABLE_TEAMS.find((t) => t.id === marketingTeamId);

  function handleSave() {
    setMarketingTeam(selected || null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div className="border border-border bg-surface p-5">
      <div className="flex items-center gap-2">
        <Users size={16} className="text-muted" />
        <p className="font-display font-bold">Marketing Team</p>
      </div>

      <p className="mt-2 text-sm text-muted">
        {current
          ? `${current.name} currently manages your connected accounts and campaigns.`
          : "No Marketing Team assigned yet — your accounts are unmanaged until you choose one."}
      </p>

      <div className="mt-4 max-w-sm">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full border border-border bg-background px-3 py-2.5 text-sm outline-none"
        >
          <option value="">No Marketing Team</option>
          {AVAILABLE_TEAMS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className="bg-accent px-5 py-2.5 text-sm font-medium text-ink hover:bg-accent-hover"
        >
          Confirm selection
        </motion.button>
        <AnimatePresence>
          {saved ? (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 text-sm text-success"
            >
              <CheckCircle2 size={15} /> Updated
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
