"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Clock, RefreshCw, ExternalLink } from "lucide-react";
import { PLATFORM_META } from "@/components/dashboard/accounts/platformMeta";
import { usePostsStore } from "@/store/usePostsStore";
import type { SocialPlatform } from "@/lib/constants";
import type { Post, PublishingLogsResponse } from "@/types";

const POLL_INTERVAL_MS = 4000;
const POLL_MAX_ATTEMPTS = 150;

/** Statuses that mean polling should stop. */
const TERMINAL_STATUSES = new Set(["success", "published", "failed", "cancelled", "error"]);

export default function PlatformStatusList({ post }: { post: Post }) {
  const { fetchPublishingLogs, retryPublishing } = usePostsStore();

  const [logs, setLogs] = useState<PublishingLogsResponse | null>(null);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  async function loadLogs() {
    try {
      const data = await fetchPublishingLogs(post.id);
      setLogs(data);
      setLogsError(null);
      // Stop polling once every log entry has reached a terminal status.
      const allDone = data.logs.every((l) => TERMINAL_STATUSES.has(l.status));
      if (allDone) stopPolling();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Failed to load publishing logs.";
      setLogsError(msg);
      stopPolling();
    }
  }

  function startPolling() {
    pollCountRef.current = 0;
    stopPolling();
    pollRef.current = setInterval(async () => {
      pollCountRef.current += 1;
      await loadLogs();
      if (pollCountRef.current >= POLL_MAX_ATTEMPTS) {
        stopPolling();
      }
    }, POLL_INTERVAL_MS);
  }

  useEffect(() => {
    // Only attempt to fetch logs for posts that have been dispatched.
    if (post.status === "draft") return;
    loadLogs();
    // Start polling for non-terminal post statuses.
    if (!TERMINAL_STATUSES.has(post.status)) {
      startPolling();
    }
    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id, post.status]);

  async function handleRetry() {
    if (post.status !== "failed") return;
    setRetrying(true);
    setRetryError(null);
    try {
      await retryPublishing(post.id);
      // Retry queued — start polling for the result.
      startPolling();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Retry failed. Please try again.";
      setRetryError(msg);
    } finally {
      setRetrying(false);
    }
  }

  if (post.status === "draft") return null;

  if (logsError) {
    return (
      <p className="text-sm text-muted">
        Could not load publishing logs: {logsError}
      </p>
    );
  }

  if (!logs) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <RefreshCw size={13} className="animate-spin" />
        Loading publishing status…
      </div>
    );
  }

  if (logs.logs.length === 0) {
    return (
      <p className="text-sm text-muted">
        No publishing attempts yet. The backend will dispatch this post at the scheduled time.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {logs.logs.map((entry) => {
          const meta = PLATFORM_META[entry.platform as SocialPlatform];
          const isSuccess = entry.status === "success" || entry.status === "published";
          const isFailed = entry.status === "failed" || entry.status === "error";

          return (
            <motion.div
              layout
              key={entry.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start justify-between border border-border bg-surface px-4 py-3"
            >
              <div className="flex items-start gap-3">
                {meta ? <meta.Icon size={16} color={meta.color} className="mt-0.5 shrink-0" /> : null}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{meta?.label ?? entry.platform}</span>

                    {isSuccess ? (
                      <span className="flex items-center gap-1 font-mono text-[11px] text-success">
                        <CheckCircle2 size={12} /> PUBLISHED
                      </span>
                    ) : isFailed ? (
                      <span className="flex items-center gap-1 font-mono text-[11px] text-danger">
                        <AlertTriangle size={12} /> FAILED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-mono text-[11px] text-muted">
                        <Clock size={12} /> PENDING
                      </span>
                    )}

                    {entry.attempt_number > 1 && (
                      <span className="font-mono text-[10px] text-muted">
                        attempt {entry.attempt_number}
                      </span>
                    )}
                  </div>

                  {/* Show actual backend error message — do not fabricate */}
                  {entry.error_message && (
                    <p className="font-mono text-[11px] text-danger">{entry.error_message}</p>
                  )}

                  {entry.platform_post_id && (
                    <p className="font-mono text-[10px] text-muted">
                      Post ID: {entry.platform_post_id}
                    </p>
                  )}

                  {entry.published_url && (
                    <a
                      href={entry.published_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-mono text-[10px] text-muted underline hover:no-underline"
                    >
                      View post <ExternalLink size={10} />
                    </a>
                  )}

                  <p className="font-mono text-[10px] text-muted">
                    {new Date(entry.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Global retry — only for failed posts */}
      {post.status === "failed" && (
        <div className="pt-1">
          {retryError && (
            <p className="mb-2 font-mono text-[11px] text-danger">{retryError}</p>
          )}
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="flex items-center gap-1.5 border border-ink/30 px-3 py-1.5 text-xs font-medium hover:bg-background disabled:opacity-60"
          >
            {retrying ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : (
              <RefreshCw size={12} />
            )}
            {retrying ? "Retrying…" : "Retry publishing"}
          </button>
          {retrying && (
            <p className="mt-1 font-mono text-[10px] text-muted">
              Polling for result…
            </p>
          )}
        </div>
      )}
    </div>
  );
}
