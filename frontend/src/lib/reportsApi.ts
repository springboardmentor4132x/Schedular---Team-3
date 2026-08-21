import axios from "axios";
import { api } from "@/lib/api";
import { daysForRange } from "@/lib/reportExport";
import type { DateRangeFilter } from "@/types/analytics";
import type { ContentType } from "@/types";
import type { SocialPlatform } from "@/lib/constants";

// MODULE 8 - REPORTS & EXPORT — backend integration
//
// Contract as confirmed by Shamitha (backend) across the Module 8 thread:
//   Base URL:            /api/reports            (NOT /api/v1/reports — confirmed)
//   POST /api/reports/preview    -> ReportPreviewResponse, nothing stored
//   POST /api/reports/generate   -> SavedReport (the saved DB row), saves + builds the file
//   GET  /api/reports/           -> { total, skip, limit, reports: SavedReport[] }
//   GET  /api/reports/{id}       -> ReportPreviewResponse (full summary/tables for a saved report)
//   GET  /api/reports/{id}/download -> the PDF/Excel file (needs Authorization header, so this
//                                       can't be a plain <a href>; see downloadReport() below)
//   DELETE /api/reports/{id}     -> deletes the report + its file
//
// This project's shared `api` client (lib/api.ts) already points at
// `${NEXT_PUBLIC_API_URL}` = "http://localhost:8000/api" — no "/v1" segment
// — so /api/reports/... sits directly under it. Unlike an earlier version
// of this integration (built against a baseline where the client defaulted
// to .../api/v1), no separate axios instance or base-URL surgery is needed
// here: every call below just hits `${api.baseURL}/reports/...` via the
// existing, already-interceptor-wired `api` export (auth header + 401
// handling both already live there — see lib/api.ts).
//
// Two things called out explicitly by Shamitha that are NOT yet confirmed and are worth
// re-checking before this ships:
//   1. Platform values ("twitter" vs "x") and content type values were never explicitly
//      re-confirmed after the first round of questions — the values below match her
//      "linkedin" / "image" examples and the app's existing SOCIAL_PLATFORMS/CONTENT_TYPES,
//      but weren't spelled out as a full enum list.
//   2. Date timezone for start_date/end_date was never answered. toBackendDateTime() below
//      sends local wall-clock time (matching the *shape* of her example exactly — no
//      offset suffix), not UTC. If report date ranges come back off-by-a-timezone, this is
//      the first place to check — swap the manual formatting for `date.toISOString()`
//      (minus the trailing "Z" and milliseconds) to send UTC instead.

// --- Backend enum values -----------------------------------------------

export type BackendReportType = "engagement" | "campaign" | "audience_growth" | "publishing" | "platform_comparison";
export type ExportFormat = "pdf" | "excel";
export type ReportStatus = "pending" | "processing" | "completed" | "failed";

// Frontend keeps its own, already-existing report-type vocabulary (used
// throughout GenerateReport.tsx/ReportsDashboard.tsx/DownloadCenter.tsx
// before this change) so the UI/routes/labels didn't need touching — this
// just maps to/from what the backend actually expects on the wire.
export type FrontendReportType = "engagement" | "campaigns" | "audience" | "publishing" | "platforms";

export const REPORT_TYPE_TO_BACKEND: Record<FrontendReportType, BackendReportType> = {
  engagement: "engagement",
  campaigns: "campaign",
  audience: "audience_growth",
  publishing: "publishing",
  platforms: "platform_comparison",
};

export const BACKEND_TYPE_TO_FRONTEND: Record<BackendReportType, FrontendReportType> = {
  engagement: "engagement",
  campaign: "campaigns",
  audience_growth: "audience",
  publishing: "publishing",
  platform_comparison: "platforms",
};

export const REPORT_TYPE_LABELS: Record<FrontendReportType, string> = {
  engagement: "Engagement Report",
  campaigns: "Campaign Report",
  audience: "Audience Growth Report",
  publishing: "Publishing Report",
  platforms: "Platform Comparison Report",
};

/**
 * Which optional filters apply to each report type — per Shamitha: "only
 * send the ones relevant to the selected report type (e.g. Campaign Report
 * needs campaign_id; Platform Comparison doesn't need any of these)", plus
 * the explicit note that campaign_id is *required* (not just applicable)
 * for the Campaign report.
 */
export interface FilterSupport {
  date: boolean;
  platform: boolean;
  campaign: boolean;
  contentType: boolean;
}

export const REPORT_FILTER_SUPPORT: Record<FrontendReportType, FilterSupport> = {
  engagement: { date: true, platform: true, campaign: true, contentType: true },
  campaigns: { date: true, platform: true, campaign: true, contentType: false },
  audience: { date: false, platform: true, campaign: false, contentType: false },
  publishing: { date: true, platform: true, campaign: true, contentType: true },
  platforms: { date: false, platform: false, campaign: false, contentType: false },
};

// --- Request/response shapes --------------------------------------------

export interface ReportGenerateRequest {
  report_type: BackendReportType;
  export_format: ExportFormat;
  campaign_id?: number;
  platform?: SocialPlatform;
  content_type?: ContentType;
  start_date?: string;
  end_date?: string;
  report_name?: string;
}

export type ReportSummary = Record<string, string | number>;
export type ReportTableRow = Record<string, string | number>;

export interface ReportPreviewResponse {
  report_type: BackendReportType;
  title: string;
  generated_at: string;
  filters_applied: Record<string, unknown>;
  summary: ReportSummary;
  tables: Record<string, ReportTableRow[]>;
}

/** The saved DB row — shape confirmed live by Shamitha (report id 10/11 examples). */
export interface SavedReport {
  id: number;
  user_id: number;
  campaign_id: number | null;
  report_name: string;
  report_type: BackendReportType;
  filters: Record<string, unknown>;
  export_format: ExportFormat;
  status: ReportStatus;
  file_path: string; // server-side only — never render this, use downloadReport()
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface ReportListResponse {
  total: number;
  skip: number;
  limit: number;
  reports: SavedReport[];
}

export interface ReportListParams {
  skip?: number;
  limit?: number;
  report_type?: BackendReportType;
  search?: string;
}

// --- Helpers: dates, campaign id, request building ----------------------

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Formats a Date as "YYYY-MM-DDTHH:mm:ss" in local wall-clock time, matching
 * the shape of Shamitha's example ("2026-07-01T00:00:00") exactly. See the
 * timezone note at the top of this file — unconfirmed which zone the
 * backend expects.
 */
function toBackendDateTime(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}:${pad(date.getSeconds())}`;
}

/** Resolves a DateRangeFilter ("7d" | "30d" | "90d" | "12m" | "all") to a start/end pair. "all" sends neither. */
export function dateRangeToWindow(range: DateRangeFilter): { start_date?: string; end_date?: string } {
  const days = daysForRange(range);
  if (days === null) return {};
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return { start_date: toBackendDateTime(start), end_date: toBackendDateTime(end) };
}

/**
 * Our campaigns still use mock string ids ("camp_4") — real backend
 * campaign ids aren't wired up yet (flagged to Shamitha already). This
 * extracts the trailing number as a stand-in until real numeric campaign
 * ids exist on our side.
 */
export function extractCampaignNumericId(mockCampaignId: string): number | undefined {
  const match = mockCampaignId.match(/(\d+)\s*$/);
  if (!match) return undefined;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : undefined;
}

export interface ReportFilterState {
  reportType: FrontendReportType;
  dateRange: DateRangeFilter;
  platform: SocialPlatform | "all";
  campaignId: string; // mock id ("camp_4") or "all"
  contentType: ContentType | "all";
  exportFormat: ExportFormat;
}

/** Builds the POST body for /preview and /generate from UI filter state, respecting REPORT_FILTER_SUPPORT. */
export function buildReportRequest(state: ReportFilterState, reportName?: string): ReportGenerateRequest {
  const support = REPORT_FILTER_SUPPORT[state.reportType];

  const payload: ReportGenerateRequest = {
    report_type: REPORT_TYPE_TO_BACKEND[state.reportType],
    export_format: state.exportFormat,
  };

  if (support.date) {
    const window = dateRangeToWindow(state.dateRange);
    if (window.start_date) payload.start_date = window.start_date;
    if (window.end_date) payload.end_date = window.end_date;
  }

  if (support.platform && state.platform !== "all") {
    payload.platform = state.platform;
  }

  if (support.campaign && state.campaignId !== "all") {
    const numericId = extractCampaignNumericId(state.campaignId);
    if (numericId !== undefined) payload.campaign_id = numericId;
  }

  if (support.contentType && state.contentType !== "all") {
    payload.content_type = state.contentType;
  }

  if (reportName) payload.report_name = reportName;

  return payload;
}

/** Front-end validation mirroring Shamitha's note: "campaign_id is required specifically for campaign report type". */
export function validateReportSelection(state: ReportFilterState): string | null {
  if (state.reportType === "campaigns" && state.campaignId === "all") {
    return "Select a campaign — the Campaign Report requires one.";
  }
  return null;
}

// --- Error message helper ------------------------------------------------

/** Backend validation/not-found errors are FastAPI's default { detail: "..." } shape (confirmed). */
export function extractErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}

// --- API calls -------------------------------------------------------------
// All paths are relative to the shared `api` client's baseURL
// ("http://localhost:8000/api" by default — see lib/api.ts), so "/reports/..."
// here resolves to ".../api/reports/...", matching Shamitha's contract.

export async function previewReport(payload: ReportGenerateRequest): Promise<ReportPreviewResponse> {
  const { data } = await api.post<ReportPreviewResponse>("/reports/preview", payload);
  return data;
}

export async function generateReport(payload: ReportGenerateRequest): Promise<SavedReport> {
  const { data } = await api.post<SavedReport>("/reports/generate", payload);
  return data;
}

export async function listReports(params: ReportListParams = {}): Promise<ReportListResponse> {
  const { data } = await api.get<ReportListResponse>("/reports/", { params });
  return data;
}

export async function getReport(id: number): Promise<ReportPreviewResponse> {
  const { data } = await api.get<ReportPreviewResponse>(`/reports/${id}`);
  return data;
}

export async function deleteReport(id: number): Promise<void> {
  await api.delete(`/reports/${id}`);
}

/**
 * Downloads a saved report's file. The endpoint requires the Authorization
 * header (see the curl example Shamitha shared), so a plain <a href> can't
 * hit it directly — this fetches the file as a blob (auth header attached
 * by lib/api.ts's request interceptor) and triggers a save via a
 * throwaway <a> tag, same download-trigger pattern the old client-side CSV
 * export used.
 */
export async function downloadReport(id: number, fallbackFilename = `report_${id}`): Promise<void> {
  const response = await api.get(`/reports/${id}/download`, { responseType: "blob" });

  const disposition: string | undefined = response.headers?.["content-disposition"];
  const match = disposition?.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] || fallbackFilename;

  const url = URL.createObjectURL(response.data as Blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
