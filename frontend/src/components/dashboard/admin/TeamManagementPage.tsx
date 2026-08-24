"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, X } from "lucide-react";
import { useTeamAssignmentsStore } from "@/store/useTeamAssignmentsStore";

export default function TeamManagementPage() {
  const groups = useTeamAssignmentsStore((s) => s.groups);
  const removeAssignment = useTeamAssignmentsStore((s) => s.removeAssignment);

  return (
    <div className="space-y-5">
      {groups.map((group, i) => (
        <motion.div
          key={group.teamId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.06 }}
          className="border border-border bg-surface"
        >
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-muted" />
              <p className="font-display font-bold">{group.teamName}</p>
            </div>
            <span className="font-mono text-xs text-muted">
              {group.assignments.length} client{group.assignments.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {group.assignments.map((a) => (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <p className="text-sm">{a.businessOwnerName}</p>
                    <p className="text-xs text-muted">{a.businessOwnerEmail}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-muted">Since {a.assignedAt}</span>
                    <button
                      onClick={() => removeAssignment(group.teamId, a.id)}
                      title="Remove assignment"
                      className="text-muted hover:text-danger"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {group.assignments.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-muted">
                No clients assigned to this team yet.
              </p>
            ) : null}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
