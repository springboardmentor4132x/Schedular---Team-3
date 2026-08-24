"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function FinalCta() {
  return (
    <section className="border-t border-border bg-ink text-background">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-7xl px-6 py-20 md:py-28 text-center"
      >
        <span className="font-mono text-xs text-background/60">FINAL CALL</span>
        <h2 className="mt-3 font-display text-3xl md:text-5xl font-extrabold tracking-tight">
          Your next post is already late for its slot.
        </h2>
        <p className="mt-4 text-background/70 max-w-md mx-auto">
          Connect your accounts, queue your first post, and let SocialPilot handle the
          dispatch.
        </p>
        <a
          href="/register"
          className="mt-8 inline-flex items-center gap-2 bg-accent px-6 py-3 font-medium text-ink transition-transform hover:scale-[1.03] hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-background focus-visible:outline-offset-2"
        >
          Start scheduling
          <ArrowRight size={18} />
        </a>
      </motion.div>
    </section>
  );
}
