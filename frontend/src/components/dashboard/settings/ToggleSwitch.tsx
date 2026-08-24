"use client";

import { motion } from "framer-motion";

export default function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description ? <p className="mt-0.5 text-xs text-muted">{description}</p> : null}
      </div>
      <button
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 border ${checked ? "border-ink bg-ink" : "border-border bg-surface"}`}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`absolute top-0.5 h-4 w-4 ${checked ? "left-[calc(100%-1.25rem)] bg-accent" : "left-0.5 bg-muted"}`}
        />
      </button>
    </div>
  );
}
