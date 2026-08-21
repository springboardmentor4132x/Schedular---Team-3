"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ChevronDown, Download, Eye, FileOutput, Maximize2, RefreshCw, Search, Trash2 } from "lucide-react";
import { useReportsStore } from "@/store/useGeneratedReportsStore";
import { ReportPreviewModal } from "./ReportPreview";
import {
  downloadReport,
  extractErrorMessage,
  REPORT_TYPE_LABELS,
  BACKEND_TYPE_TO_FRONTEND,
  REPORT_TYPE_TO_BACKEND,
  type BackendReportType,
  type FrontendReportType,
  type SavedReport,
} from "@/lib/reportsApi";

// MODULE 8 - REPORTS & EXPORT (Part 2 - Download Center) — backend integration
//
// Lists reports from GET /api/reports/ (search + report_type filters sent
// server-side, per Shamitha's contract) instead of a local snapshot store.
// Each row: Eye opens a quick modal (fetches the full summary/tables via
// GET /api/reports/{id} on open), Maximize2 opens the dedicated full-page
// preview route, Download hits GET /api/reports/{id}/download, and Delete
// calls DELETE /api/reports/{id} via the store.

const TYPE_OPTIONS: { value: FrontendReportType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "engagement", label: REPORT_TYPE_LABELS.engagement },
  { value: "campaigns", label: REPORT_TYPE_LABELS.campaigns },
  { value: "audience", label: REPORT_TYPE_LABELS.audience },
  { value: "publishing", label: REPORT_TYPE_LABELS.publishing },
  { value: "platforms", label: REPORT_TYPE_LABELS.platforms },
];

const STATUS_LABEL: Record<SavedReport["status"], string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <label className="sr-only">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="appearance-none border border-border bg-surface py-2 pl-3 pr-8 text-sm outline-none focus:border-accent-hover">
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" />
    </div>
  );
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DownloadCenter() {
  const pathname = usePathname();
  const reportsHref = pathname.replace(/\/history$/, "");

  const reports = useReportsStore((s) => s.reports);
  const isLoading = useReportsStore((s) => s.isLoading);
  const hasLoaded = useReportsStore((s) => s.hasLoaded);
  const error = useReportsStore((s) => s.error);
  const fetchReports = useReportsStore((s) => s.fetchReports);
  const removeReport = useReportsStore((s) => s.removeReport);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FrontendReportType | "all">("all");
  const [previewingId, setPreviewingId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  // Search + report_type filter are sent to the backend (per the contract:
  // GET /api/reports/?skip=0&limit=20&report_type=engagement&search=xyz),
  // debounced so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const backendType: BackendReportType | undefined = typeFilter === "all" ? undefined : REPORT_TYPE_TO_BACKEND[typeFilter];
    const timer = setTimeout(() => {
      fetchReports({ report_type: backendType, search: query.trim() || undefined });
    }, 300);
    return () => clearTimeout(timer);
  }, [query, typeFilter, fetchReports]);

  const previewingReport = useMemo(() => reports.find((r) => r.id === previewingId) ?? null, [reports, previewingId]);

  async function handleDownload(report: SavedReport) {
    setDownloadingId(report.id);
    setRowError(null);
    try {
      await downloadReport(report.id, `${report.report_name}.${report.export_format === "pdf" ? "pdf" : "xlsx"}`);
    } catch (err) {
      setRowError(extractErrorMessage(err, "Couldn't download that report."));
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleDelete(report: SavedReport) {
    setRowError(null);
    await removeReport(report.id);
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={reportsHref} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft size={14} />
          Back to Reports
        </Link>
        <h1 className="mt-2 font-display text-xl font-bold">Download Center</h1>
        <p className="mt-1 text-sm text-muted">Every report you&apos;ve generated — search, filter, preview, re-download, or delete.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by report name…"
            className="w-full border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-accent-hover"
          />
        </div>
        <FilterSelect label="Report Type" value={typeFilter} onChange={(v) => setTypeFilter(v as FrontendReportType | "all")}>
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </FilterSelect>
      </div>

      {error || rowError ? <p className="text-xs text-danger">{error ?? rowError}</p> : null}

      <div className="overflow-x-auto border border-border bg-surface">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted">
              <th className="py-3 pl-4 pr-4 font-mono font-normal">REPORT</th>
              <th className="py-3 pr-4 font-mono font-normal">FORMAT</th>
              <th className="py-3 pr-4 font-mono font-normal">STATUS</th>
              <th className="py-3 pr-4 font-mono font-normal">GENERATED</th>
              <th className="py-3 pr-4 text-right font-mono font-normal">DOWNLOADS</th>
              <th className="py-3 pr-4 text-right font-mono font-normal">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && !hasLoaded ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-muted">
                  <RefreshCw size={16} className="mx-auto mb-2 animate-spin" />
                  Loading reports…
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-muted">
                  No reports match your search or filters, or none have been generated yet.{" "}
                  <Link href={`${reportsHref}/generate`} className="font-medium text-ink underline hover:no-underline">
                    Generate your first report
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id} className="border-b border-border last:border-b-0">
                  <td className="py-3 pl-4 pr-4">
                    <p className="font-medium text-ink">{report.report_name}</p>
                    <p className="mt-0.5 text-xs text-muted">{REPORT_TYPE_LABELS[BACKEND_TYPE_TO_FRONTEND[report.report_type]]}</p>
                  </td>
                  <td className="py-3 pr-4 uppercase text-muted">{report.export_format === "pdf" ? "PDF" : "Excel"}</td>
                  <td className="py-3 pr-4 text-ink">{STATUS_LABEL[report.status]}</td>
                  <td className="py-3 pr-4 text-ink" title={new Date(report.created_at).toLocaleString()}>
                    {formatRelativeTime(report.created_at)}
                  </td>
                  <td className="py-3 pr-4 text-right text-muted">{report.download_count}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setPreviewingId(report.id)}
                        title="Quick preview"
                        aria-label={`Quick preview ${report.report_name}`}
                        className="text-muted hover:text-ink">
                        <Eye size={14} />
                      </button>
                      <Link
                        href={`${reportsHref}/preview/${report.id}`}
                        title="Open full preview"
                        aria-label={`Open full preview of ${report.report_name}`}
                        className="text-muted hover:text-ink">
                        <Maximize2 size={14} />
                      </Link>
                      <button
                        onClick={() => handleDownload(report)}
                        disabled={downloadingId === report.id || report.status !== "completed"}
                        title="Download"
                        aria-label={`Download ${report.report_name}`}
                        className="text-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-50">
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(report)}
                        title="Delete"
                        aria-label={`Delete ${report.report_name}`}
                        className="text-muted hover:text-danger">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {reports.length > 0 ? (
        <Link
          href={`${reportsHref}/generate`}
          className="inline-flex items-center gap-1.5 border border-border bg-surface px-3 py-2 text-sm font-medium hover:border-accent-hover">
          <FileOutput size={14} />
          Generate Another Report
        </Link>
      ) : null}

      {previewingReport ? <ReportPreviewModal report={previewingReport} onClose={() => setPreviewingId(null)} /> : null}
    </div>
  );
}
