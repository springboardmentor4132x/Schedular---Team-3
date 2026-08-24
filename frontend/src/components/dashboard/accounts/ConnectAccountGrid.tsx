"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, X } from "lucide-react";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/lib/constants";
import { useAccountsStore } from "@/store/useAccountsStore";
import { PLATFORM_META } from "./platformMeta";
import AccountCard from "./AccountCard";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function ConnectAccountGrid() {
  const { fetchAccounts, isLoading, hasLoaded, error, clearError } = useAccountsStore();
  const [oauthError, setOauthError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Handle incoming OAuth failure query parameters (e.g. ?error=connection_failed&platform=instagram)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get("error");
      const platformParam = params.get("platform");

      if (errorParam) {
        let platformLabel = "";
        if (platformParam) {
          const meta = PLATFORM_META[platformParam.toLowerCase() as SocialPlatform];
          platformLabel = meta?.label || platformParam.charAt(0).toUpperCase() + platformParam.slice(1);
        }

        setOauthError(
          platformLabel
            ? `${platformLabel} connection failed. Please try connecting again.`
            : "Account connection failed. Please try connecting again."
        );

        // Clean up the URL search params so the error does not persist across refreshes
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
      }
    }
  }, []);

  // Only render platforms that are not hidden (excludes Pinterest while keeping Facebook present)
  const visiblePlatforms = SOCIAL_PLATFORMS.filter(
    (platform) => PLATFORM_META[platform]?.availability !== "hidden"
  );

  return (
    <div className="space-y-4">
      {oauthError && (
        <div className="flex items-center justify-between border border-accent/40 bg-surface p-4 text-xs">
          <div className="flex items-center gap-2 text-ink">
            <AlertCircle size={15} className="text-accent-hover shrink-0" />
            <span>{oauthError}</span>
          </div>
          <button
            onClick={() => setOauthError(null)}
            className="text-muted hover:text-ink"
            aria-label="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between border border-accent/40 bg-surface p-4 text-xs">
          <div className="flex items-center gap-2 text-ink">
            <AlertCircle size={15} className="text-accent-hover" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => {
              clearError();
              fetchAccounts();
            }}
            className="flex items-center gap-1 underline hover:no-underline"
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {isLoading && !hasLoaded ? (
        <div className="flex items-center justify-center gap-2 border border-border bg-surface p-12 text-sm text-muted">
          <RefreshCw size={16} className="animate-spin" />
          <span>Loading connected accounts…</span>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-5 sm:grid-cols-2"
        >
          {visiblePlatforms.map((platform) => (
            <motion.div key={platform} variants={item}>
              <AccountCard platform={platform as SocialPlatform} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

