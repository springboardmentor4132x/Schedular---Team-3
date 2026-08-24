"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/lib/validation";

const PATH_ROLE: { prefix: string; roles: Role[] }[] = [
  { prefix: "/administrator", roles: ["administrator"] },
  { prefix: "/business-owner", roles: ["business_owner", "business_user"] },
  { prefix: "/marketing-team", roles: ["marketing_team"] },
  { prefix: "/content-creator", roles: ["content_creator"] },
];

/**
 * Route guard for every dashboard page.
 *
 * TODO once the backend is live: replace this with a real check against the
 * httpOnly-cookie session (see Next.js middleware.ts) so unauthorized users
 * are blocked before a page ever renders server-side, not just redirected
 * client-side after the fact. This client-side version is a placeholder so
 * the dashboards are navigable and demoable before that integration lands.
 */
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, setMockRole } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      if (process.env.NODE_ENV === "development") {
        const match = PATH_ROLE.find((p) => pathname.startsWith(p.prefix));
        if (match) {
          setMockRole(match.roles[0]);
          return;
        }
      }
      router.replace("/login");
      return;
    }

    // Role must match the section being viewed — a Business Owner navigating
    // straight to /administrator should be bounced to their own dashboard.
    const section = PATH_ROLE.find((p) => pathname.startsWith(p.prefix));
    const ownSection = PATH_ROLE.find((p) => p.roles.includes(user.role as Role));
    if (section && !section.roles.includes(user.role as Role)) {
      router.replace(ownSection?.prefix ?? "/login");
    }
  }, [user, pathname, router, setMockRole]);

  if (!user) return null;

  return <>{children}</>;
}
