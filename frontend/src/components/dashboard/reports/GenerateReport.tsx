"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, ArrowLeft, ChevronDown, Download, FileOutput, Loader2, Maximize2, RefreshCw } from "lucide-react";

import { useCampaignsStore } from "@/store/useCampaignsStore";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/lib/constants";
import { CONTENT_TYPES } from "@/lib/content";
import { DATE_RANGE_OPTIONS } from "@/components/dashboard/analytics/AnalyticsFilters";
import ReportContentView from "./ReportContentView";
import {
  buildReportRequest,
  downloadReport,
  extractErrorMessage,
  generateReport,
  getReport,
  previewReport,
  validateReportSelection,
  REPORT_FILTER_SUPPORT,
  REPORT_TYPE_LABELS,
  type ExportFormat,
  type FrontendReportType,
  type ReportFilterState,
  type ReportPreviewResponse,
  type SavedReport,
} from "@/lib/reportsApi";

import type { ContentType } from "@/types";
import type { DateRangeFilter } from "@/types/analytics";

// MODULE 8 - REPORTS & EXPORT — backend integration
//
// Replaces the old fully-local "compute a table client-side, export via
// Blob/print dialog" flow with Shamitha's backend contract:
//   - Filters change -> live-preview via POST /api/reports/preview
//     (nothing saved, matches her "call this first ... to show them the
//     report before saving anything" note).
//   - "Generate Report" click -> POST /api/reports/generate, which saves
//     the report and builds the real PDF/Excel file server-side. The
//     saved-report response has no summary/tables (confirmed — it's the
//     DB row shape), so right after saving we fetch GET /api/reports/{id}
//     to show exactly what got saved, and to unlock the Download button
//     (generation is synchronous — confirmed status is always "completed"
//     by the time /generate returns, so no polling is needed).

const REPORT_TYPE_OPTIONS: { value: FrontendReportType; label: string }[] = [
  { value: "engagement", label: REPORT_TYPE_LABELS.engagement },
  { value: "campaigns", label: REPORT_TYPE_LABELS.campaigns },
  { value: "audience", label: REPORT_TYPE_LABELS.audience },
  { value: "publishing", label: REPORT_TYPE_LABELS.publishing },
  { value: "platforms", label: REPORT_TYPE_LABELS.platforms },
];

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  disabledHint?: string;
  children: ReactNode;
}

function FilterSelect({ label, value, onChange, disabled = false, disabledHint, children }: FilterSelectProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted">{label}</label>

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          aria-label={label}
          className="w-full appearance-none border border-border bg-surface py-2 pl-3 pr-8 text-sm outline-none focus:border-accent-hover disabled:cursor-not-allowed disabled:bg-background disabled:text-muted"
        >
          {children}
        </select>

        <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" />
      </div>

      {disabled && disabledHint ? <p className="mt-1 text-[11px] text-muted">{disabledHint}</p> : null}
    </div>
  );
}

export default function GenerateReport() {
  const pathname = usePathname();
  const reportsHref = pathname.replace(/\/generate$/, "");

  const campaigns = useCampaignsStore((state) => state.campaigns);
  const fetchCampaigns = useCampaignsStore((state) => state.fetchCampaigns);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const [reportType, setReportType] = useState<FrontendReportType>("engagement");
  const [dateRange, setDateRange] = useState<DateRangeFilter>("30d");
  const [platform, setPlatform] = useState<SocialPlatform | "all">("all");
  const [campaignId, setCampaignId] = useState<string>("all");
  const [contentType, setContentType] = useState<ContentType | "all">("all");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("pdf");

  const filterState: ReportFilterState = { reportType, dateRange, platform, campaignId, contentType, exportFormat };
  const support = REPORT_FILTER_SUPPORT[reportType];
  const selectionError = validateReportSelection(filterState);

  // Live preview (POST /preview) — refetches whenever the filters change,
  // debounced slightly so flipping through selects doesn't fire a request
  // per keystroke/click.
  const [preview, setPreview] = useState<ReportPreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    if (selectionError) {
      setPreview(null);
      setPreviewError(null);
      return;
    }

    let cancelled = false;
    setPreviewLoading(true);
    setPreviewError(null);

    const timer = setTimeout(async () => {
      try {
        const payload = buildReportRequest(filterState);
        const data = await previewReport(payload);
        if (!cancelled) setPreview(data);
      } catch (error) {
        if (!cancelled) {
          setPreview(null);
          setPreviewError(extractErrorMessage(error, "Couldn't load a preview for these filters."));
        }
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType, dateRange, platform, campaignId, contentType, exportFormat]);

  // Generate & save (POST /generate) — separate from the live preview above.
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [savedReport, setSavedReport] = useState<SavedReport | null>(null);
  const [savedContent, setSavedContent] = useState<ReportPreviewResponse | null>(null);
  const [downloading, setDownloading] = useState(false);

  async function handleGenerate() {
    if (selectionError) {
      setGenerateError(selectionError);
      return;
    }

    setGenerating(true);
    setGenerateError(null);
    setSavedReport(null);
    setSavedContent(null);

    try {
      const payload = buildReportRequest(filterState);
      const saved = await generateReport(payload);
      setSavedReport(saved);

      // /generate returns the DB row only (no summary/tables) — fetch the
      // full content for the report we just saved so the page can show
      // exactly what was generated, not just a "saved successfully" note.
      const content = await getReport(saved.id);
      setSavedContent(content);
    } catch (error) {
      setGenerateError(extractErrorMessage(error, "Couldn't generate the report. Please try again."));
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownload() {
    if (!savedReport) return;
    setDownloading(true);
    try {
      await downloadReport(savedReport.id, `${savedReport.report_name}.${savedReport.export_format === "pdf" ? "pdf" : "xlsx"}`);
    } catch (error) {
      setGenerateError(extractErrorMessage(error, "Couldn't download the report file."));
    } finally {
      setDownloading(false);
    }
  }

  const displayed = savedContent ?? preview;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href={reportsHref} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft size={14} />
          Back to Reports
        </Link>

        <h1 className="mt-2 font-display text-xl font-bold">Generate Report</h1>

        <p className="mt-1 text-sm text-muted">Choose a report type and filters to preview, then generate and save your report.</p>
      </div>

      {/* Configuration */}
      <div className="border border-border bg-surface p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Report Type */}
          <FilterSelect
            label="Report Type"
            value={reportType}
            onChange={(value) => {
              setReportType(value as FrontendReportType);
              setSavedReport(null);
              setSavedContent(null);
            }}
          >
            {REPORT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>

          {/* Date Range */}
          <FilterSelect
            label="Date Range"
            value={dateRange}
            onChange={(value) => setDateRange(value as DateRangeFilter)}
            disabled={!support.date}
            disabledHint="Not applicable to this report"
          >
            {DATE_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>

          {/* Platform */}
          <FilterSelect
            label="Platform"
            value={platform}
            onChange={(value) => setPlatform(value as SocialPlatform | "all")}
            disabled={!support.platform}
            disabledHint="Not applicable to this report"
          >
            <option value="all">All Platforms</option>
            {SOCIAL_PLATFORMS.map((item) => (
              <option key={item} value={item} className="capitalize">
                {item}
              </option>
            ))}
          </FilterSelect>

          {/* Campaign */}
          <FilterSelect
            label="Campaign"
            value={campaignId}
            onChange={setCampaignId}
            disabled={!support.campaign}
            disabledHint={support.campaign ? undefined : "Not applicable to this report"}
          >
            <option value="all">{reportType === "campaigns" ? "Select a campaign" : "All Campaigns"}</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </FilterSelect>

          {/* Content Type */}
          <FilterSelect
            label="Content Type"
            value={contentType}
            onChange={(value) => setContentType(value as ContentType | "all")}
            disabled={!support.contentType}
            disabledHint="Not applicable to this report"
          >
            <option value="all">All Content Types</option>
            {CONTENT_TYPES.map((content) => (
              <option key={content.value} value={content.value}>
                {content.label}
              </option>
            ))}
          </FilterSelect>

          {/* Export Format */}
          <FilterSelect label="Export Format" value={exportFormat} onChange={(value) => setExportFormat(value as ExportFormat)}>
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
          </FilterSelect>
        </div>

        {reportType === "campaigns" && campaignId === "all" ? (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
            <AlertTriangle size={12} />
            The Campaign Report requires a specific campaign — select one above to generate.
          </p>
        ) : null}

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating || Boolean(selectionError)}
          className="mt-5 flex items-center gap-2 border border-ink bg-ink px-4 py-2.5 text-sm font-medium text-surface hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {generating ? <Loader2 size={15} className="animate-spin" /> : <FileOutput size={15} />}
          {generating ? "Generating…" : "Generate Report"}
        </button>

        {generateError ? <p className="mt-2 text-xs text-danger">{generateError}</p> : null}
      </div>

      {/* Preview / Generated content */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
          <div>
            <p className="font-display font-bold">{REPORT_TYPE_LABELS[reportType]}</p>
            {savedReport ? (
              <p className="mt-0.5 text-xs text-muted">Saved as &ldquo;{savedReport.report_name}&rdquo;</p>
            ) : (
              <p className="mt-0.5 text-xs text-muted">Live preview — nothing is saved until you click Generate Report.</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {savedReport ? (
              <>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-1 text-xs font-medium text-muted underline hover:text-ink hover:no-underline disabled:cursor-not-allowed"
                >
                  <Download size={12} />
                  {downloading ? "Downloading…" : "Download File"}
                </button>
                <Link
                  href={`${reportsHref}/preview/${savedReport.id}`}
                  className="flex items-center gap-1 text-xs font-medium text-muted underline hover:text-ink hover:no-underline"
                >
                  <Maximize2 size={12} />
                  Open Full Preview
                </Link>
              </>
            ) : null}
            <Link href={`${reportsHref}/history`} className="text-xs font-medium text-muted underline hover:text-ink hover:no-underline">
              View in Download Center
            </Link>
          </div>
        </div>

        {previewError && !savedContent ? <p className="text-xs text-danger">{previewError}</p> : null}

        {previewLoading && !displayed ? (
          <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border bg-surface p-16 text-center">
            <RefreshCw size={20} className="animate-spin text-muted" />
            <p className="text-sm text-muted">Loading preview…</p>
          </div>
        ) : displayed ? (
          <ReportContentView data={displayed} />
        ) : selectionError ? (
          <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-border bg-surface p-16 text-center">
            <p className="text-sm text-muted">{selectionError}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
