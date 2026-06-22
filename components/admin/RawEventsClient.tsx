"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminFetch } from "@/lib/admin/client";
import { RAW_EVENT_AREAS, type RawEventArea } from "@/lib/admin/rawEventAreas";
import type {
  AnalyticsRawResponse,
  AnalyticsRawRow,
} from "@/types/adminAnalytics";

/**
 * RAW event log viewer for the admin console — replaces the PM's daily manual
 * CSV fill. Area tabs (Home/Auth/Gap/...) mirror the data sheet 1:1; each tab
 * shows common columns + that area's properties columns, with date range,
 * pagination, and CSV download (current page).
 *
 * Console renders outside next-intl, so copy is Korean inline.
 */

const PAGE_SIZE = 50;

/** Common columns shown for every area (sheet's shared columns). */
const COMMON_COLS: { key: keyof AnalyticsRawRow; label: string }[] = [
  { key: "createdAt", label: "created_at" },
  { key: "eventName", label: "event_name" },
  { key: "userId", label: "user_id" },
  { key: "countryCode", label: "country_code" },
  { key: "countryGroup", label: "country_group" },
  { key: "membershipStatus", label: "membership_status" },
  { key: "pagePath", label: "page_path" },
  { key: "deviceType", label: "device_type" },
];

/** Last 7 days as YYYY-MM-DD (UTC). */
function defaultRange(): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  const fromDate = new Date(now);
  fromDate.setUTCDate(fromDate.getUTCDate() - 6);
  return { from: fromDate.toISOString().slice(0, 10), to };
}

/** Cell display: nullish → "", objects → JSON, else string. */
function cell(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

/** Quote a CSV field (wrap + escape quotes when needed). */
function csvField(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function RawEventsClient() {
  const init = useMemo(defaultRange, []);
  const [from, setFrom] = useState(init.from);
  const [to, setTo] = useState(init.to);
  const [areaId, setAreaId] = useState(RAW_EVENT_AREAS[0].id);
  const [page, setPage] = useState(0);

  const [data, setData] = useState<AnalyticsRawResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const area: RawEventArea =
    RAW_EVENT_AREAS.find((a) => a.id === areaId) ?? RAW_EVENT_AREAS[0];

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const qs =
      `?from=${from}&to=${to}` +
      `&eventNames=${encodeURIComponent(area.eventNames.join(","))}` +
      `&page=${page}&pageSize=${PAGE_SIZE}`;
    const res = await adminFetch<AnalyticsRawResponse>(
      `/api/admin/analytics/raw${qs}`
    );
    if (!res.ok || !res.data) {
      setError(res.message ?? "원본 로그를 불러오지 못했습니다.");
      setData(null);
    } else {
      setData(res.data);
    }
    setLoading(false);
  }, [from, to, area.eventNames, page]);

  useEffect(() => {
    void load();
  }, [load]);

  // Reset to first page when switching area or date range.
  const switchArea = (id: string) => {
    setAreaId(id);
    setPage(0);
  };

  const columns = useMemo(
    () => [...COMMON_COLS.map((c) => c.label), ...area.propColumns.map((c) => c.label)],
    [area]
  );

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  /** Build CSV from the current page and trigger a download. */
  const downloadCsv = () => {
    const header = columns.join(",");
    const lines = rows.map((r) => {
      const common = COMMON_COLS.map((c) => csvField(cell(r[c.key])));
      const props = area.propColumns.map((c) =>
        csvField(cell((r.properties ?? {})[c.key]))
      );
      return [...common, ...props].join(",");
    });
    const csv = [header, ...lines].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `events_${area.id}_${from}_${to}_p${page + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Date range + download */}
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm text-muted">
          시작일
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(0);
            }}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-foreground"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted">
          종료일
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(0);
            }}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-foreground"
          />
        </label>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
        >
          {loading ? "불러오는 중…" : "조회"}
        </button>
        <button
          type="button"
          onClick={downloadCsv}
          disabled={rows.length === 0}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-hover disabled:opacity-50"
        >
          CSV 다운로드 (이 페이지)
        </button>
        <span className="text-xs text-muted">
          ※ 날짜 경계 UTC 기준. 총 {total.toLocaleString()}건.
        </span>
      </div>

      {/* Area tabs */}
      <div className="flex flex-wrap gap-1 border-b border-border">
        {RAW_EVENT_AREAS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => switchArea(a.id)}
            className={`px-3 py-2 text-sm transition-colors ${
              a.id === areaId
                ? "border-b-2 border-brand font-medium text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-down">{error}</p>}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-xs">
          <thead className="bg-surface text-muted">
            <tr>
              {columns.map((c) => (
                <th key={c} className="whitespace-nowrap px-3 py-2 text-left font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-6 text-center text-muted">
                  {loading ? "불러오는 중…" : "데이터가 없습니다."}
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i} className="border-t border-border">
                  {COMMON_COLS.map((c) => (
                    <td key={c.key} className="whitespace-nowrap px-3 py-1.5 text-foreground">
                      {cell(r[c.key])}
                    </td>
                  ))}
                  {area.propColumns.map((c) => (
                    <td key={c.key} className="whitespace-nowrap px-3 py-1.5 text-foreground">
                      {cell((r.properties ?? {})[c.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">
          {page + 1} / {totalPages} 페이지
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
            className="rounded-lg border border-border px-3 py-1.5 text-foreground hover:bg-surface-hover disabled:opacity-50"
          >
            이전
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || loading}
            className="rounded-lg border border-border px-3 py-1.5 text-foreground hover:bg-surface-hover disabled:opacity-50"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
