"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

export default function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2 font-display font-extrabold">
      <motion.span
        initial={{ rotate: -8 }}
        whileHover={{ rotate: 8, scale: 1.08 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="flex h-7 w-7 items-center justify-center bg-accent text-ink"
      >
        <Send size={14} strokeWidth={2.5} />
      </motion.span>
      <span>
        Social
        <span className="relative">
          Pilot
          <motion.span
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.25 }}
            className="absolute -bottom-0.5 left-0 h-[3px] w-full origin-left bg-accent"
          />
        </span>
      </span>
    </Link>
  );
}
