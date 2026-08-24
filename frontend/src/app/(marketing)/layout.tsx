import type { ReactNode } from "react";
import Link from "next/link";
import Logo from "@/components/layout/Logo";
import Footer from "@/components/layout/Footer";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="h-16 border-b border-border flex items-center justify-between px-6">
        <Logo />
        <nav className="flex items-center gap-6 text-sm text-muted">
          <Link href="/#pricing" className="hover:text-ink">Pricing</Link>
          <Link href="/login" className="hover:text-ink">Sign in</Link>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
