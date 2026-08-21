"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { ArrowLeft, Download, FileOutput, RefreshCw } from "lucide-react";
import ReportContentView from "./ReportContentView";
import { downloadReport, extractErrorMessage, getReport, type ReportPreviewResponse } from "@/lib/reportsApi";

// MODULE 8 - REPORTS & EXPORT (Report Preview page/route) — backend integration
//
// Route-level counterpart to ReportPreviewModal, addressable by its own
// URL. Fetches the saved report's full content directly via
// GET /api/reports/{id} (works on a fresh page load / direct link, not
// just navigation from the Download Center), and renders it with the same
// ReportContentView every other Module 8 surface uses.
//
// Route-agnostic (usePathname/useParams only) so the same component works
// unmodified at both:
//   /business-owner/reports/preview/[reportId]
//   /marketing-team/clients/[businessOwnerId]/reports/preview/[reportId]

export default function ReportPreviewPage() {
  const pathname = usePathname();
  const params = useParams<{ reportId: string }>();
  const reportId = Number(params.reportId);

  // ".../reports/preview/<id>" -> ".../reports/history" and ".../reports"
  const historyHref = pathname.replace(/\/preview\/[^/]+$/, "/history");
  const reportsHref = historyHref.replace(/\/history$/, "");

  const [content, setContent] = useState<ReportPreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(reportId)) {
      setLoading(false);
      setError("Invalid report id.");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getReport(reportId)
      .then((data) => {
        if (!cancelled) setContent(data);
      })
      .catch((err) => {
        // Confirmed 404 shape: { detail: "Report not found" }
        if (!cancelled) setError(extractErrorMessage(err, "This report couldn't be found."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reportId]);

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadReport(reportId, content ? `${content.title}` : `report_${reportId}`);
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't download the report file."));
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Link href={historyHref} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft size={14} />
          Back to Download Center
        </Link>
        <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border bg-surface p-16 text-center">
          <RefreshCw size={20} className="animate-spin text-muted" />
          <p className="text-sm text-muted">Loading report…</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="space-y-6">
        <Link href={historyHref} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft size={14} />
          Back to Download Center
        </Link>

        <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border bg-surface p-16 text-center">
          <p className="text-sm text-muted">{error ?? "This report couldn't be found."}</p>
          <Link
            href={`${reportsHref}/generate`}
            className="flex items-center gap-1.5 border border-ink bg-ink px-4 py-2.5 text-sm font-medium text-surface hover:opacity-90">
            <FileOutput size={15} />
            Generate a New Report
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href={historyHref} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft size={14} />
        Back to Download Center
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-5">
        <div>
          <h1 className="font-display text-xl font-bold">{content.title}</h1>
          <p className="mt-1 text-sm text-muted">Generated {new Date(content.generated_at).toLocaleString()}</p>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-1.5 border border-border bg-surface px-3 py-2 text-sm font-medium hover:border-accent-hover disabled:cursor-not-allowed disabled:opacity-50">
          <Download size={14} />
          {downloading ? "Downloading…" : "Download File"}
        </button>
      </div>

      <ReportContentView data={content} />
    </div>
  );
}
