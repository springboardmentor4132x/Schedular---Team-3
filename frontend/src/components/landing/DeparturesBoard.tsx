"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const STATUS_CYCLE = ["SCHEDULED", "PUBLISHING", "PUBLISHED"] as const;

const ROWS = [
  { platform: "INSTAGRAM", post: "Fall Collection Launch", time: "09:00" },
  { platform: "LINKEDIN", post: "Q3 Product Update", time: "10:30" },
  { platform: "X", post: "Behind-the-Scenes Reel", time: "12:15" },
  { platform: "YOUTUBE", post: "Weekly Roundup", time: "14:00" },
  { platform: "PINTEREST", post: "Style Guide Pins", time: "16:45" },
];

function Flap({ value }: { value: string }) {
  return (
    <div className="relative h-6 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center font-mono text-xs tracking-wider"
          style={{ transformOrigin: "center" }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function BoardRow({ row, delay }: { row: (typeof ROWS)[number]; delay: number }) {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const start = setTimeout(() => {
      const interval = setInterval(() => {
        setStatusIndex((i) => (i + 1) % STATUS_CYCLE.length);
      }, 2600);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(start);
  }, [delay]);

  const status = STATUS_CYCLE[statusIndex];
  const statusColor =
    status === "PUBLISHED"
      ? "text-ink font-semibold"
      : status === "PUBLISHING"
        ? "text-ink underline decoration-accent decoration-2 underline-offset-4"
        : "text-muted";

  return (
    <div className="grid grid-cols-[1fr_2fr_1.2fr_0.8fr] gap-4 items-center border-t border-border px-4 py-3 bg-surface">
      <span className="font-mono text-xs text-muted">{row.platform}</span>
      <span className="text-sm truncate">{row.post}</span>
      <span className={statusColor}>
        <Flap value={status} />
      </span>
      <span className="font-mono text-xs text-muted">{row.time}</span>
    </div>
  );
}

export default function DeparturesBoard() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
        <span className="font-mono text-xs text-muted">LIVE BOARD</span>
        <h2 className="mt-2 font-display text-3xl md:text-4xl font-extrabold tracking-tight max-w-lg">
          Every post, right on schedule.
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 border border-ink/15 bg-ink text-background"
      >
        <div className="grid grid-cols-[1fr_2fr_1.2fr_0.8fr] gap-4 px-4 py-3 font-mono text-[11px] text-background/60 tracking-wider">
          <span>PLATFORM</span>
          <span>POST</span>
          <span>STATUS</span>
          <span>TIME</span>
        </div>
        <div className="bg-background text-ink">
          {ROWS.map((row, i) => (
            <BoardRow key={row.platform} row={row} delay={i * 450} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
