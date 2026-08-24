"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { usePostsStore } from "@/store/usePostsStore";
import { PLATFORM_META } from "@/components/dashboard/accounts/platformMeta";
import type { SocialPlatform } from "@/lib/constants";
import type { PublishingLogsResponse } from "@/types";

/**
 * Publishing Logs page.
 *
 * There is no global GET /api/publishing/logs endpoint.
 * Backend only provides: GET /api/publishing/logs/{post_id}
 *
 * This component:
 * 1. Fetches all published/failed posts from GET /api/posts/.
 * 2. Lets the user pick a post.
 * 3. Fetches logs for the selected post via GET /api/publishing/logs/{post_id}.
 *
 * TODO: If the backend ever exposes a global logs endpoint, replace the
 * two-step fetch with a single call.
 */
export default function PublishingLogs() {
  const { posts, fetchPosts, fetchPublishingLogs } = usePostsStore();

  const [selectedPostId, setSelectedPostId] = useState<string | number | null>(null);
  const [logs, setLogs] = useState<PublishingLogsResponse | null>(null);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "success" | "failed">("all");

  // Load published + failed posts so the picker is populated.
  useEffect(() => {
    fetchPosts({ status: "published" });
    fetchPosts({ status: "failed" });
  }, [fetchPosts]);

  // The picker shows posts that could have publishing log entries.
  const loggablePosts = posts.filter(
    (p) => p.status === "published" || p.status === "failed"
  );

  async function loadLogs(postId: string | number) {
    setSelectedPostId(postId);
    setLogsLoading(true);
    setLogsError(null);
    setLogs(null);
    try {
      const data = await fetchPublishingLogs(postId);
      setLogs(data);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Failed to load publishing logs.";
      setLogsError(msg);
    } finally {
      setLogsLoading(false);
    }
  }

  const filteredLogs =
    !logs
      ? []
      : logs.logs.filter((l) => {
          if (filter === "all") return true;
          if (filter === "success") return l.status === "success" || l.status === "published";
          return l.status === "failed" || l.status === "error";
        });

  return (
    <div>
      {/* Post picker */}
      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-medium">Post</label>
        <select
          value={selectedPostId ?? ""}
          onChange={(e) => {
            if (e.target.value) loadLogs(e.target.value);
            else {
              setSelectedPostId(null);
              setLogs(null);
            }
          }}
          className="border border-border bg-surface px-3 py-2 text-sm outline-none"
        >
          <option value="">— Select a post —</option>
          {loggablePosts.map((p) => (
            <option key={p.id} value={String(p.id)}>
              [{p.status.toUpperCase()}] {p.caption.slice(0, 60)}{p.caption.length > 60 ? "…" : ""}
            </option>
          ))}
        </select>
        {selectedPostId && (
          <button
            onClick={() => loadLogs(selectedPostId)}
            className="flex items-center gap-1 border border-border px-3 py-2 text-xs hover:bg-background"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        )}
      </div>

      {loggablePosts.length === 0 && (
        <p className="text-sm text-muted">
          No published or failed posts yet. Publishing logs will appear here once the backend has dispatched scheduled posts.
        </p>
      )}

      {/* Status filter tabs */}
      {logs && (
        <div className="mb-4 flex gap-2">
          {(["all", "success", "failed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`border px-3 py-1.5 text-xs font-mono ${
                filter === f ? "border-ink bg-ink text-background" : "border-border text-muted"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {logsLoading && (
        <div className="flex items-center gap-2 py-4 text-sm text-muted">
          <RefreshCw size={14} className="animate-spin" />
          Loading logs…
        </div>
      )}

      {logsError && (
        <p className="text-sm text-danger">{logsError}</p>
      )}

      {logs && !logsLoading && (
        <div className="overflow-x-auto border border-border bg-surface">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-border font-mono text-[11px] text-muted">
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Platform</th>
                <th className="px-4 py-3">Attempt #</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Platform Post ID</th>
                <th className="px-4 py-3">Error / Response</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const meta = PLATFORM_META[log.platform as SocialPlatform];
                const isSuccess = log.status === "success" || log.status === "published";
                return (
                  <tr key={log.id} className="border-b border-border align-top">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        {meta ? <meta.Icon size={14} color={meta.color} /> : null}
                        {meta?.label ?? log.platform}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{log.attempt_number}</td>
                    <td className="px-4 py-3">
                      {isSuccess ? (
                        <span className="flex items-center gap-1 font-mono text-[11px] text-success">
                          <CheckCircle2 size={12} /> SUCCEEDED
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-mono text-[11px] text-danger">
                          <AlertTriangle size={12} /> FAILED
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {log.platform_post_id ?? "—"}
                    </td>
                    <td
                      className="max-w-[280px] truncate px-4 py-3 font-mono text-[11px] text-muted"
                      title={log.error_message ?? undefined}
                    >
                      {log.error_message ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-muted">
              {logs.logs.length === 0
                ? "No publish attempts logged for this post yet."
                : "No entries match the selected filter."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
