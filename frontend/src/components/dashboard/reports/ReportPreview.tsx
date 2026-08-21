"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, Maximize2, RefreshCw, X } from "lucide-react";
import ReportContentView from "./ReportContentView";
import { downloadReport, extractErrorMessage, getReport, type ReportPreviewResponse, type SavedReport } from "@/lib/reportsApi";

// MODULE 8 - REPORTS & EXPORT (Part 2 - Download Center) — backend integration
//
// Quick modal preview of a saved report. Takes the SavedReport row (already
// in memory from the Download Center's list) for the header/metadata, and
// fetches the full summary/tables content on open via GET /api/reports/{id}
// — the list endpoint doesn't include that, only /preview, /generate, and
// /{id} do.

export function ReportPreviewModal({ report, onClose }: { report: SavedReport; onClose: () => void }) {
  const pathname = usePathname();
  // pathname here is always ".../reports/history" (this modal only ever
  // renders from DownloadCenter), so this deep-links to the sibling
  // ".../reports/preview/[reportId]" route.
  const previewHref = `${pathname.replace(/\/history$/, "")}/preview/${report.id}`;

  const [content, setContent] = useState<ReportPreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getReport(report.id)
      .then((data) => {
        if (!cancelled) setContent(data);
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, "Couldn't load this report."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [report.id]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadReport(report.id, `${report.report_name}.${report.export_format === "pdf" ? "pdf" : "xlsx"}`);
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't download that report."));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview of ${report.report_name}`}>
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col border border-border bg-surface"
        onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div>
            <p className="font-display text-lg font-bold">{report.report_name}</p>
            <p className="mt-1 text-xs text-muted">Generated {new Date(report.created_at).toLocaleString()}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close preview"
            className="flex h-8 w-8 shrink-0 items-center justify-center border border-border hover:border-accent-hover">
            <X size={14} />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
              <RefreshCw size={18} className="animate-spin text-muted" />
              <p className="text-sm text-muted">Loading report…</p>
            </div>
          ) : error ? (
            <p className="text-sm text-danger">{error}</p>
          ) : content ? (
            <ReportContentView data={content} />
          ) : null}
        </div>

        <div className="flex items-center gap-2 border-t border-border p-4">
          <button
            onClick={handleDownload}
            disabled={downloading || report.status !== "completed"}
            className="flex items-center gap-1.5 border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:border-accent-hover disabled:cursor-not-allowed disabled:opacity-50">
            <Download size={13} />
            {downloading ? "Downloading…" : "Download File"}
          </button>
          <Link
            href={previewHref}
            onClick={onClose}
            className="ml-auto flex items-center gap-1.5 border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:border-accent-hover">
            <Maximize2 size={13} />
            Open Full Preview
          </Link>
        </div>
      </div>
    </div>
  );
}
