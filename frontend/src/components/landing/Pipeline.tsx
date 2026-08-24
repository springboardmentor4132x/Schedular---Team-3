"use client";

import { motion } from "framer-motion";
import { FileEdit, CalendarClock, Send, LineChart } from "lucide-react";

const STAGES = [
  {
    label: "01",
    title: "Draft",
    description:
      "Write a post, drop in media, and preview exactly how it'll look on each platform before it goes anywhere.",
    icon: FileEdit,
  },
  {
    label: "02",
    title: "Schedule",
    description:
      "Drop it onto a shared calendar, set a recurring slot, and let it sit in the queue until its time comes.",
    icon: CalendarClock,
  },
  {
    label: "03",
    title: "Dispatch",
    description:
      "SocialPilot publishes to every connected platform at the scheduled time, retrying automatically if one fails.",
    icon: Send,
  },
  {
    label: "04",
    title: "Analyze",
    description:
      "Engagement, reach, and audience growth roll up by post and by campaign, so the next queue is better than the last.",
    icon: LineChart,
  },
];

export default function Pipeline() {
  return (
    <section id="pipeline" className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="font-mono text-xs text-muted">HOW IT WORKS</span>
          <h2 className="mt-2 font-display text-3xl md:text-4xl font-extrabold tracking-tight max-w-lg">
            One queue, start to finish.
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-px bg-border md:grid-cols-4 border border-border">
          {STAGES.map((stage, i) => (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-surface p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted">{stage.label}</span>
                <stage.icon size={20} className="text-ink" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold">{stage.title}</h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">{stage.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
