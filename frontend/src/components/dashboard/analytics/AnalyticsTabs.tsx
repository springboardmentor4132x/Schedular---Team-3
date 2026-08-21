"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AnalyticsTabs() {
  const pathname = usePathname();

  // Works unmodified under both /analytics (Business Owner) and
  // /clients/[id]/analytics (Marketing Team client workspace) since it
  // locates "/analytics" in the current path rather than assuming a fixed
  // prefix.
  const marker = "/analytics";
  const markerIndex = pathname.indexOf(marker);
  const base = markerIndex === -1 ? pathname : pathname.slice(0, markerIndex + marker.length);

  const tabs = [
    { label: "Dashboard", href: base },
    { label: "Content", href: `${base}/content` },
    { label: "Audience", href: `${base}/audience` },
    { label: "Campaigns", href: `${base}/campaigns` },
    { label: "Platforms", href: `${base}/platforms` },
    { label: "Trends", href: `${base}/trends` },
  ];

  return (
    <div className="flex flex-wrap gap-1 border-b border-border">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "border-ink text-ink"
                : "border-transparent text-muted hover:border-border hover:text-ink"
            }`}>
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}