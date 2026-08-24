import type { ReactNode } from "react";
import Logo from "@/components/layout/Logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="h-16 border-b border-border flex items-center px-6">
        <Logo />
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
