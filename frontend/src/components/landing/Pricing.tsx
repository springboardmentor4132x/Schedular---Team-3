"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const TIERS = [
  {
    name: "Creator",
    price: "₹1,499",
    period: "/mo",
    description: "For a single creator running their own accounts.",
    features: ["3 connected platforms", "30 scheduled posts/mo", "Basic analytics", "Email support"],
    highlighted: false,
  },
  {
    name: "Team",
    price: "₹4,999",
    period: "/mo",
    description: "For marketing teams managing a handful of clients.",
    features: [
      "All 6 platforms",
      "Unlimited scheduling",
      "Campaign management",
      "Client workspace isolation",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    name: "Agency",
    price: "Custom",
    period: "",
    description: "For agencies managing many business clients at scale.",
    features: [
      "Everything in Team",
      "Unlimited clients & seats",
      "Role-based permissions",
      "Dedicated account manager",
      "SLA & onboarding support",
    ],
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-16 md:py-20 border-t border-border">
      <motion.div
        initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
        <span className="font-mono text-xs text-muted">PRICING</span>
        <h2 className="mt-2 font-display text-3xl md:text-4xl font-extrabold tracking-tight max-w-lg">
          Straightforward plans, no surprise fees.
        </h2>
      </motion.div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {TIERS.map((tier, i) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -6 }}
            className={`flex flex-col border p-6 shadow-sm transition-shadow hover:shadow-lg ${
              tier.highlighted ? "border-ink bg-ink text-background" : "border-border bg-surface"
            }`}
          >
            {tier.highlighted ? (
              <span className="mb-3 inline-block w-fit bg-accent px-2 py-0.5 font-mono text-[11px] text-ink">
                MOST POPULAR
              </span>
            ) : null}
            <h3 className="font-display text-xl font-bold">{tier.name}</h3>
            <p className={`mt-1 text-sm ${tier.highlighted ? "text-background/70" : "text-muted"}`}>
              {tier.description}
            </p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="font-display text-3xl font-extrabold">{tier.price}</span>
              <span className={tier.highlighted ? "text-background/70" : "text-muted"}>
                {tier.period}
              </span>
            </div>

            <ul className="mt-6 flex-1 space-y-2.5">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check size={16} className={tier.highlighted ? "text-accent mt-0.5" : "text-ink mt-0.5"} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <a
              href="/register"
              className={`mt-8 inline-flex items-center justify-center px-5 py-2.5 font-medium transition-transform hover:scale-[1.02] ${
                tier.highlighted
                  ? "bg-accent text-ink hover:bg-accent-hover"
                  : "border border-ink/30 text-ink hover:bg-background"
              }`}
            >
              Get started
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
