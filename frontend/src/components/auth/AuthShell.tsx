import type { ReactNode } from "react";

export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-6 py-16">
      <span className="font-mono text-xs text-muted">{eyebrow}</span>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-2 text-muted">{subtitle}</p>

      <div className="mt-8 border border-border bg-surface p-6">{children}</div>

      <p className="mt-6 text-center text-sm text-muted">{footer}</p>
    </div>
  );
}
