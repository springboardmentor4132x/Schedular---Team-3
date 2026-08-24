"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const Scene3D = dynamic(() => import("./Scene3D"), {
  ssr: false,
  loading: () => <div className="h-[380px] md:h-[540px] w-full bg-ink" />,
});

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Hero() {
  return (
    <section className="relative border-b border-border">
      <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-2 gap-10 items-center py-16 md:py-24">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.h1
            variants={item}
            className="font-display text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight"
          >
            Write once.
            <br />
            Dispatch to{" "}
            <span className="bg-accent/40 px-1 box-decoration-clone">every platform.</span>
          </motion.h1>

          <motion.p variants={item} className="mt-6 max-w-md text-muted text-lg">
            SocialPilot is the departures board for your content. Queue a post,
            set its schedule, and watch it go out to Facebook, Instagram, LinkedIn,
            X, YouTube, and Pinterest right on time.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="/register"
              className="inline-flex items-center gap-2 bg-accent px-5 py-3 font-medium text-ink transition-transform hover:scale-[1.03] hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
            >
              Start scheduling
              <ArrowRight size={18} />
            </a>
            <a
              href="/login"
              className="inline-flex items-center gap-2 border border-ink/30 px-5 py-3 font-medium text-ink transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
            >
              Sign in
            </a>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-muted"
          >
            <span>FACEBOOK</span>
            <span>INSTAGRAM</span>
            <span>LINKEDIN</span>
            <span>X</span>
            <span>YOUTUBE</span>
            <span>PINTEREST</span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] as const, delay: 0.2 }}
        >
          <Scene3D />
        </motion.div>
      </div>
    </section>
  );
}
