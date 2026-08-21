"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, FileOutput, FolderDown, RefreshCw } from "lucide-react";
import { DATE_RANGE_OPTIONS } from "@/components/dashboard/analytics/AnalyticsFilters";
import ReportContentView from "./ReportContentView";
import {
  buildReportRequest,
  extractErrorMessage,
  previewReport,
  REPORT_FILTER_SUPPORT,
  type FrontendReportType,
  type ReportPreviewResponse,
} from "@/lib/reportsApi";
import type { DateRangeFilter } from "@/types/analytics";

// MODULE 8 - REPORTS & EXPORT — backend integration
//
// Single hub page covering all five report types, now backed by
// POST /api/reports/preview instead of local mock computation — switching
// tabs (or the date range, where applicable) calls preview live. Nothing
// is ever saved from this page; that only happens from the "Generate
// Report" page (a sibling route, unchanged link below), which is also
// where PDF/Excel export lives now (the backend builds the real file on
// Generate — this hub is browse-only, matching Shamitha's note that
// /preview "shows them the report before saving anything").

const REPORT_TABS: { value: FrontendReportType; label: string }[] = [
  { value: "engagement", label: "Engagement" },
  { value: "campaigns", label: "Campaigns" },
  { value: "audience", label: "Audience Growth" },
  { value: "publishing", label: "Publishing" },
  { value: "platforms", label: "Platform Comparison" },
];

export default function ReportsDashboard() {
  const pathname = usePathname();
  const [activeReport, setActiveReport] = useState<FrontendReportType>("engagement");
  const [dateRange, setDateRange] = useState<DateRangeFilter>("30d");

  const support = REPORT_FILTER_SUPPORT[activeReport];

  const [data, setData] = useState<ReportPreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Platform comparison / campaigns tabs need no campaign_id selection at
    // this browse-only level (campaign_id is only required on the
    // dedicated Generate Report page, where a specific campaign can be
    // picked) — the campaigns tab here just omits it, same as before.
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const payload = buildReportRequest({
          reportType: activeReport,
          dateRange,
          platform: "all",
          campaignId: "all",
          contentType: "all",
          exportFormat: "pdf",
        });
        const result = await previewReport(payload);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setData(null);
          setError(extractErrorMessage(err, "Couldn't load this report."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeReport, dateRange]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold">Reports &amp; Export</h1>
          <p className="mt-1 text-sm text-muted">
            Browse engagement, campaign, audience, publishing, and platform comparison reports.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`${pathname}/history`}
            className="flex items-center gap-1.5 border border-border bg-surface px-3 py-2 text-sm font-medium hover:border-accent-hover">
            <FolderDown size={14} />
            Download Center
          </Link>
          <Link
            href={`${pathname}/generate`}
            className="flex items-center gap-1.5 border border-border bg-surface px-3 py-2 text-sm font-medium hover:border-accent-hover">
            <FileOutput size={14} />
            Generate Report
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-0">
        <div className="flex flex-wrap gap-1">
          {REPORT_TABS.map((tab) => {
            const isActive = tab.value === activeReport;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveReport(tab.value)}
                className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-ink text-ink"
                    : "border-transparent text-muted hover:border-border hover:text-ink"
                }`}>
                {tab.label}
              </button>
            );
          })}
        </div>

        {support.date ? (
          <div className="relative pb-2.5">
            <label className="sr-only">Date range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeFilter)}
              aria-label="Date range"
              className="appearance-none border border-border bg-surface py-2 pl-3 pr-8 text-sm outline-none focus:border-accent-hover">
              {DATE_RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" />
          </div>
        ) : null}
      </div>

      {error ? <p className="text-xs text-danger">{error}</p> : null}

      {loading && !data ? (
        <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border bg-surface p-16 text-center">
          <RefreshCw size={20} className="animate-spin text-muted" />
          <p className="text-sm text-muted">Loading report…</p>
        </div>
      ) : data ? (
        <ReportContentView data={data} />
      ) : null}
    </div>
  );
}
