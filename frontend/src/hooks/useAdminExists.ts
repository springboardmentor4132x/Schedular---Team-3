"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

/**
 * Checks GET /api/auth/available-roles to decide whether the Administrator
 * role should be shown in the registration form.
 *
 * The backend returns the list of roles that are still available for
 * registration. Once an Administrator account has been created, the backend
 * removes "administrator" from that list.
 *
 * ⚠️  RESPONSE SHAPE ASSUMPTION:
 * The live backend was not reachable during implementation, so the shape below
 * is the standard FastAPI convention for a plain list endpoint:
 *
 *   GET /api/auth/available-roles → string[]
 *   e.g. ["marketing_team", "content_creator", "business_owner"]
 *
 * If the backend wraps the array (e.g. { roles: [...] }) update the
 * extraction on the line marked "SHAPE" below — no other code needs to change.
 *
 * Fails safe: if the endpoint is unreachable we assume an admin already exists
 * so the option stays hidden rather than risking a duplicate admin sign-up.
 *
 * Public interface is unchanged — callers still receive { adminExists, loading }.
 */
export function useAdminExists() {
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api
      .get<string[]>("/auth/available-roles") // SHAPE: adjust generic if wrapped
      .then((res) => {
        if (!cancelled) {
          // Administrator no longer in available roles → an admin account exists.
          const roles: string[] = Array.isArray(res.data)
            ? res.data
            : (res.data as unknown as { roles: string[] }).roles ?? [];
          setAdminExists(!roles.includes("administrator"));
        }
      })
      .catch(() => {
        if (!cancelled) setAdminExists(true); // fail safe
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { adminExists, loading };
}
