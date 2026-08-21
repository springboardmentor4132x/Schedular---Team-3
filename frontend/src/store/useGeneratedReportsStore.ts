"use client";

import { create } from "zustand";
import {
  deleteReport as deleteReportRequest,
  listReports,
  extractErrorMessage,
  type BackendReportType,
  type SavedReport,
} from "@/lib/reportsApi";

// MODULE 8 - REPORTS & EXPORT (Part 2 - Download Center) — backend integration
//
// This store used to hold a client-side snapshot of every generated report
// (localStorage-persisted, no backend). Now that Shamitha's backend saves
// reports and serves them back via GET /api/reports/, this store is a thin
// wrapper around that list endpoint instead — the backend is the source of
// truth, so nothing here is persisted locally anymore. DownloadCenter.tsx
// is the primary consumer; GenerateReport.tsx no longer writes to this
// store directly (it calls reportsApi.generateReport itself and fetches
// its own preview content) — a fresh fetchReports() picks up new reports
// whenever the Download Center is opened.

interface ReportsState {
  reports: SavedReport[];
  total: number;
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  fetchReports: (params?: { report_type?: BackendReportType; search?: string; skip?: number; limit?: number }) => Promise<void>;
  removeReport: (id: number) => Promise<void>;
}

export const useReportsStore = create<ReportsState>((set, get) => ({
  reports: [],
  total: 0,
  isLoading: false,
  hasLoaded: false,
  error: null,

  fetchReports: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await listReports({ skip: 0, limit: 50, ...params });
      set({ reports: data.reports, total: data.total, isLoading: false, hasLoaded: true });
    } catch (error) {
      set({ isLoading: false, hasLoaded: true, error: extractErrorMessage(error, "Couldn't load reports.") });
    }
  },

  removeReport: async (id) => {
    const previous = get().reports;
    // Optimistic remove, rolled back on failure so a failed delete doesn't
    // silently disappear a report the user still has.
    set({ reports: previous.filter((r) => r.id !== id) });
    try {
      await deleteReportRequest(id);
    } catch (error) {
      set({ reports: previous, error: extractErrorMessage(error, "Couldn't delete that report.") });
    }
  },
}));

// Back-compat alias — everything in this project imported the old name.
export const useGeneratedReportsStore = useReportsStore;
