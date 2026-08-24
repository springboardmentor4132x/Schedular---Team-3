"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  X,
  RefreshCw,
} from "lucide-react";
import { usePostsStore } from "@/store/usePostsStore";
import { PLATFORM_META } from "@/components/dashboard/accounts/platformMeta";
import type { SocialPlatform } from "@/lib/constants";
import type { Post, PublishingLogsResponse } from "@/types";
import type { AxiosError } from "axios";

const POLL_INTERVAL_MS = 4000;
const POLL_MAX_ATTEMPTS = 150;
const TERMINAL_STATUSES = new Set(["success", "published", "failed", "cancelled", "error"]);

type PublishStep = "idle" | "submitting" | "polling" | "success" | "failed" | "error";

interface PublishNowModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PublishNowModal({
  post,
  isOpen,
  onClose,
  onSuccess,
}: PublishNowModalProps) {
  const { publishNow, fetchPublishingLogs, fetchPosts } = usePostsStore();

  const [step, setStep] = useState<PublishStep>("idle");
  const [queuedMessage, setQueuedMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<PublishingLogsResponse | null>(null);
  const [pollAttempt, setPollAttempt] = useState(0);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  // Reset state when opening modal
  useEffect(() => {
    if (isOpen) {
      setStep("idle");
      setQueuedMessage("");
      setErrorMessage(null);
      setLogs(null);
      setPollAttempt(0);
      pollCountRef.current = 0;
      stopPolling();
    } else {
      stopPolling();
    }
    return stopPolling;
  }, [isOpen]);

  if (!isOpen || !post) return null;

  // Backend allows Manual Publish Now ONLY when status is "draft" or "scheduled"
  const isEligible = post.status === "draft" || post.status === "scheduled";

  async function pollLogs(postId: string | number) {
    try {
      const data = await fetchPublishingLogs(postId);
      setLogs(data);

      const postStatus = data.status;
      const logsList = data.logs || [];

      if (logsList.length > 0) {
        const allDone = logsList.every((l) => TERMINAL_STATUSES.has(l.status));
        const hasFailed = logsList.some((l) => l.status === "failed" || l.status === "error");
        const hasSucceeded = logsList.some((l) => l.status === "success" || l.status === "published");

        if (allDone || postStatus === "published" || postStatus === "failed") {
          stopPolling();
          if (hasSucceeded && !hasFailed) {
            setStep("success");
            fetchPosts();
            if (onSuccess) onSuccess();
          } else {
            setStep("failed");
            fetchPosts();
          }
          return;
        }
      } else if (postStatus === "published" || postStatus === "failed") {
        stopPolling();
        if (postStatus === "published") {
          setStep("success");
          fetchPosts();
          if (onSuccess) onSuccess();
        } else {
          setStep("failed");
          fetchPosts();
        }
        return;
      }

      if (pollCountRef.current >= POLL_MAX_ATTEMPTS) {
        stopPolling();
        fetchPosts();
      }
    } catch {
      // Polling error: continue next tick until max attempts
    }
  }

  function startPolling(postId: string | number) {
    pollCountRef.current = 0;
    setPollAttempt(0);
    stopPolling();

    // Initial check immediately
    pollLogs(postId);

    pollRef.current = setInterval(async () => {
      pollCountRef.current += 1;
      setPollAttempt(pollCountRef.current);
      await pollLogs(postId);
      if (pollCountRef.current >= POLL_MAX_ATTEMPTS) {
        stopPolling();
      }
    }, POLL_INTERVAL_MS);
  }

  async function handlePublish() {
    if (!post) return;
    if (!isEligible) {
      setErrorMessage(
        `Cannot publish now from status '${post.status}'. Only draft or scheduled posts can be published immediately.`
      );
      setStep("error");
      return;
    }

    setStep("submitting");
    setErrorMessage(null);

    try {
      const res = await publishNow(post.id);
      // Confirmed backend response: { status: "queued", post_id: number, message: "Post queued for immediate publishing" }
      setQueuedMessage(res.message || "Post queued for immediate publishing");
      setStep("polling");

      // Start polling publishing logs
      startPolling(post.id);
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>;
      const detail =
        axiosErr.response?.data?.detail ??
        axiosErr.message ??
        "Failed to publish post immediately. Please try again.";
      setErrorMessage(detail);
      setStep("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg border border-border bg-surface shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Send size={16} className="text-accent" />
            <h3 className="font-display font-bold text-ink">Publish Now</h3>
          </div>
          <button
            onClick={() => {
              stopPolling();
              onClose();
            }}
            className="text-muted hover:text-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Post Summary */}
          <div className="border border-border bg-background p-3">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Post #{post.id}</span>
              <span className="font-mono uppercase font-semibold">
                Status: {post.status}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-ink line-clamp-2">{post.caption}</p>
            {post.platforms.length > 0 && (
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-[11px] text-muted">Target platforms:</span>
                {post.platforms.map((p) => {
                  const meta = PLATFORM_META[p as SocialPlatform];
                  return meta ? (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1 border border-border bg-surface px-1.5 py-0.5 text-[10px]"
                    >
                      <meta.Icon size={11} color={meta.color} />
                      {meta.label}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Ineligible Status Warning */}
          {!isEligible && (
            <div className="flex items-start gap-2 border border-danger/40 bg-danger/10 p-3 text-xs text-danger">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Action not allowed</p>
                <p>
                  Only posts with status <strong>draft</strong> or <strong>scheduled</strong> can
                  be published immediately. Current status is <strong>{post.status}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Initial Confirmation State */}
          {step === "idle" && isEligible && (
            <p className="text-sm text-muted">
              This will immediately send this post to the backend publishing queue for dispatch to all selected platforms.
            </p>
          )}

          {/* Submitting Loading State */}
          {step === "submitting" && (
            <div className="flex items-center gap-2 py-3 text-sm text-ink">
              <Loader2 size={16} className="animate-spin text-accent" />
              <span>Submitting publish request to backend…</span>
            </div>
          )}

          {/* Queued / Polling State */}
          {step === "polling" && (
            <div className="space-y-3">
              <div className="border border-border bg-accent-soft p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                  <Clock size={14} className="text-ink" />
                  <span>{queuedMessage || "Post queued for immediate publishing."}</span>
                </div>
                <p className="mt-1 text-[11px] text-muted">
                  The post has been handed to the background Celery worker. Polling live publishing status from backend…
                </p>
              </div>

              {/* Polling live logs if available */}
              {logs && logs.logs.length > 0 && (
                <div className="space-y-2 border border-border bg-background p-3">
                  <p className="text-xs font-semibold text-ink">Platform Status:</p>
                  {logs.logs.map((log) => {
                    const meta = PLATFORM_META[log.platform as SocialPlatform];
                    const isSuccess = log.status === "success" || log.status === "published";
                    const isFailed = log.status === "failed" || log.status === "error";

                    return (
                      <div
                        key={log.id}
                        className="flex items-start justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start gap-2">
                          {meta ? <meta.Icon size={14} color={meta.color} className="mt-0.5" /> : null}
                          <div>
                            <p className="text-xs font-medium">{meta?.label ?? log.platform}</p>
                            {log.error_message && (
                              <p className="font-mono text-[11px] text-danger">{log.error_message}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          {isSuccess ? (
                            <span className="flex items-center gap-1 font-mono text-[10px] text-success">
                              <CheckCircle2 size={11} /> PUBLISHED
                            </span>
                          ) : isFailed ? (
                            <span className="flex items-center gap-1 font-mono text-[10px] text-danger">
                              <AlertTriangle size={11} /> FAILED
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 font-mono text-[10px] text-muted">
                              <RefreshCw size={11} className="animate-spin" /> PENDING
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Success Terminal State */}
          {step === "success" && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 border border-success/40 bg-success/10 p-3 text-xs text-success">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Publishing Completed</p>
                  <p>The post was successfully published to the target social account(s).</p>
                </div>
              </div>

              {logs && logs.logs.length > 0 && (
                <div className="space-y-2 border border-border bg-background p-3">
                  {logs.logs.map((log) => {
                    const meta = PLATFORM_META[log.platform as SocialPlatform];
                    return (
                      <div key={log.id} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-medium">
                          {meta ? <meta.Icon size={14} color={meta.color} /> : null}
                          {meta?.label ?? log.platform}
                        </span>
                        {log.published_url ? (
                          <a
                            href={log.published_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 font-mono text-[11px] text-muted underline hover:no-underline"
                          >
                            View post <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span className="font-mono text-[10px] text-success">PUBLISHED</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Failed Terminal State */}
          {step === "failed" && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 border border-danger/40 bg-danger/10 p-3 text-xs text-danger">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Publishing Failed</p>
                  <p>The backend encountered errors while publishing this post.</p>
                </div>
              </div>

              {logs && logs.logs.length > 0 && (
                <div className="space-y-2 border border-border bg-background p-3">
                  {logs.logs.map((log) => {
                    const meta = PLATFORM_META[log.platform as SocialPlatform];
                    return (
                      <div key={log.id} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-medium">
                            {meta ? <meta.Icon size={14} color={meta.color} /> : null}
                            {meta?.label ?? log.platform}
                          </span>
                          <span className="font-mono text-[10px] text-danger">FAILED</span>
                        </div>
                        {log.error_message && (
                          <p className="font-mono text-[11px] text-danger">{log.error_message}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Backend Error State (e.g. 400 / 404 response) */}
          {step === "error" && errorMessage && (
            <div className="flex items-start gap-2 border border-danger/40 bg-danger/10 p-3 text-xs text-danger">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Publish Error</p>
                <p className="font-mono text-[11px] mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 border-t border-border px-5 py-3 bg-surface">
          {step === "idle" && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="border border-border px-4 py-2 text-xs font-medium text-muted hover:bg-background hover:text-ink"
              >
                Cancel
              </button>
              {isEligible && (
                <button
                  type="button"
                  onClick={handlePublish}
                  className="inline-flex items-center gap-1.5 bg-accent px-4 py-2 text-xs font-medium text-ink hover:bg-accent-hover"
                >
                  <Send size={13} />
                  Publish Now
                </button>
              )}
            </>
          )}

          {step === "submitting" && (
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1.5 bg-accent px-4 py-2 text-xs font-medium text-ink opacity-60"
            >
              <Loader2 size={13} className="animate-spin" />
              Publishing…
            </button>
          )}

          {step === "polling" && (
            <button
              type="button"
              onClick={() => {
                stopPolling();
                onClose();
              }}
              className="border border-border px-4 py-2 text-xs font-medium text-muted hover:bg-background hover:text-ink"
            >
              Continue in background
            </button>
          )}

          {(step === "success" || step === "failed" || step === "error") && (
            <button
              type="button"
              onClick={() => {
                stopPolling();
                onClose();
              }}
              className="bg-accent px-4 py-2 text-xs font-medium text-ink hover:bg-accent-hover"
            >
              Close
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
