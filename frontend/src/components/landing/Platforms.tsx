"use client";

import { motion } from "framer-motion";
import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter, FaYoutube, FaPinterest } from "react-icons/fa6";

const PLATFORMS = [
  { name: "Facebook", Icon: FaFacebook, color: "#1877F2" },
  { name: "Instagram", Icon: FaInstagram, color: "#E1306C" },
  { name: "LinkedIn", Icon: FaLinkedin, color: "#0A66C2" },
  { name: "X", Icon: FaXTwitter, color: "#000000" },
  { name: "YouTube", Icon: FaYoutube, color: "#FF0000" },
  { name: "Pinterest", Icon: FaPinterest, color: "#E60023" },
];

export default function Platforms() {
  return (
    <section id="platforms" className="mx-auto max-w-7xl px-6 py-16 md:py-20 border-t border-border">
      <span className="font-mono text-xs text-muted">DESTINATIONS</span>
      <h2 className="mt-2 font-display text-3xl md:text-4xl font-extrabold tracking-tight max-w-lg">
        Everywhere your audience already is.
      </h2>

      <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4">
        {PLATFORMS.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            whileHover={{ y: -4 }}
            className="flex items-center justify-between border border-border bg-surface px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <p.Icon size={24} color={p.color} />
              <span className="font-medium">{p.name}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
