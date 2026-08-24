"use client";

import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";

export const Field = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }
>(function Field({ label, error, hint, id, ...props }, ref) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        {...props}
        aria-invalid={!!error}
        className={`w-full border bg-background px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent-hover ${
          error ? "border-accent" : "border-border"
        }`}
      />
      {error ? (
        <p className="mt-1 text-xs font-medium text-ink">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
});

const CHECKS = [
  { test: (v: string) => v.length >= 8, label: "8+ characters" },
  { test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v), label: "Upper & lowercase" },
  { test: (v: string) => /\d/.test(v), label: "A number" },
  { test: (v: string) => /[^A-Za-z0-9]/.test(v), label: "A symbol" },
];

export function PasswordStrength({ value }: { value: string }) {
  const passed = CHECKS.filter((c) => c.test(value || "")).length;
  const label = ["Too weak", "Weak", "Fair", "Good", "Strong"][passed];

  return (
    <div className="mb-4 -mt-2">
      <div className="flex gap-1">
        {CHECKS.map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 ${i < passed ? "bg-accent" : "bg-border"}`}
          />
        ))}
      </div>
      <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted">
        {CHECKS.map((c) => (
          <li key={c.label} className={c.test(value || "") ? "text-accent-hover" : ""}>
            {c.test(value || "") ? "✓" : "·"} {c.label}
          </li>
        ))}
      </ul>
      {value ? <p className="mt-1 text-xs text-muted">{label}</p> : null}
    </div>
  );
}
