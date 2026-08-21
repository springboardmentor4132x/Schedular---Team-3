"use client";

import { motion } from "framer-motion";

export default function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3 }}
      className="border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <p className="font-mono text-xs text-muted">{label.toUpperCase()}</p>
      <p className="mt-2 font-display text-2xl font-extrabold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </motion.div>
  );
}
