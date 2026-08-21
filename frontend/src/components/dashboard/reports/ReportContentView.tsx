"use client";

import StatCard from "@/components/dashboard/StatCard";
import { formatNumber } from "@/lib/reportExport";
import type { ReportPreviewResponse, ReportTableRow } from "@/lib/reportsApi";

// MODULE 8 - REPORTS & EXPORT — backend integration
//
// Generic renderer for whatever a ReportPreviewResponse contains, since the
// backend's `summary`/`tables` shape is dynamic per report type (per
// Shamitha: "the keys inside `tables` vary by report type — e.g.
// `top_performing_posts` for Engagement, `platform_comparison` for Platform
// Comparison"). Rather than hand-writing five bespoke table layouts (one
// per report type, guessing at column names that could change server-side),
// this reads keys off the data itself:
//  - `summary` is a flat key/value object -> one StatCard per entry
//  - each entry in `tables` is a named list of row objects -> one table per
//    entry, with columns derived from the keys of its first row
//
// This intentionally trades a little visual polish (column order/casing
// comes straight from the API) for not silently dropping fields the
// backend adds or renames later.

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") return formatNumber(value);
  return String(value);
}

function SummaryStats({ summary }: { summary: Record<string, string | number> }) {
  const entries = Object.entries(summary);
  if (entries.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {entries.map(([key, value]) => (
        <StatCard
          key={key}
          label={humanizeKey(key)}
          value={typeof value === "number" ? formatNumber(value) : String(value)}
        />
      ))}
    </div>
  );
}

function DataTable({ title, rows }: { title: string; rows: ReportTableRow[] }) {
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-ink">{humanizeKey(title)}</p>
      <div className="overflow-x-auto border border-border bg-surface">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted">
              {columns.map((col) => (
                <th key={col} className="whitespace-nowrap py-3 pl-4 pr-4 font-mono font-normal first:pl-4">
                  {humanizeKey(col).toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={Math.max(columns.length, 1)} className="py-8 text-center text-sm text-muted">
                  No data available for this table.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                // eslint-disable-next-line react/no-array-index-key -- rows have no stable id from the API
                <tr key={i} className="border-b border-border last:border-b-0">
                  {columns.map((col) => (
                    <td key={col} className="whitespace-nowrap py-3 pl-4 pr-4 text-ink first:font-medium">
                      {formatCell(row[col])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ReportContentView({ data }: { data: ReportPreviewResponse }) {
  const tableEntries = Object.entries(data.tables ?? {});

  return (
    <div className="space-y-6">
      <SummaryStats summary={data.summary ?? {}} />
      {tableEntries.length > 0 ? (
        <div className="space-y-6">
          {tableEntries.map(([key, rows]) => (
            <DataTable key={key} title={key} rows={rows} />
          ))}
        </div>
      ) : null}
      {Object.keys(data.summary ?? {}).length === 0 && tableEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-border bg-surface p-16 text-center">
          <p className="text-sm text-muted">No data available for this report yet.</p>
        </div>
      ) : null}
    </div>
  );
}
