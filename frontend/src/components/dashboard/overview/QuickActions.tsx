"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileEdit, Link2, Users, Building2, Search, Bell, FileText } from "lucide-react";

// Server Components (page.tsx files) can only pass plain data across the
// boundary — never a component/function reference like a Lucide icon. So
// callers pass one of these string keys, and the actual icon component is
// resolved here, entirely inside client-side code.
const ICONS = { FileEdit, Link2, Users, Building2, Search, Bell, FileText } as const;

export type QuickActionIcon = keyof typeof ICONS;

export interface QuickAction {
  label: string;
  href: string;
  icon: QuickActionIcon;
  primary?: boolean;
}

export default function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action, i) => {
        const Icon = ICONS[action.icon];
        return (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Link
              href={action.href}
              className={`flex items-center gap-2 border px-4 py-2.5 text-sm font-medium transition-transform hover:scale-[1.02] ${
                action.primary ? "border-ink bg-accent text-ink hover:bg-accent-hover" : "border-border bg-surface"
              }`}
            >
              <Icon size={16} />
              {action.label}
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
