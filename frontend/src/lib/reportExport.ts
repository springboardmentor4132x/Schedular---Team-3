import type { DateRangeFilter } from "@/types/analytics";

// MODULE 8 - REPORTS & EXPORT
//
// Previously (frontend-only phase) this file held client-side CSV/PDF
// generation — report tables were computed locally and exported via a
// downloaded Blob or a browser print dialog. Now that Shamitha's backend
// generates the real PDF/Excel files server-side (GET /api/reports/{id}/download,
// see lib/reportsApi.ts), that client-side export code is gone. This file
// keeps only the small formatting helpers still used elsewhere in Module 8:
//  - formatNumber: for rendering summary stat cards and table cells
//  - daysForRange: for converting a DateRangeFilter into a start/end window
//    when building a report request (see reportsApi.ts's dateRangeToWindow)

export function daysForRange(range: DateRangeFilter): number | null {
  if (range === "7d") return 7;
  if (range === "30d") return 30;
  if (range === "90d") return 90;
  if (range === "12m") return 365;
  return null; // "all"
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}
