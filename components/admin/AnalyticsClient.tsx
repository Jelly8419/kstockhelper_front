"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { adminFetch } from "@/lib/admin/client";
import type {
  AnalyticsDauResponse,
  AnalyticsFunnelResponse,
  AnalyticsEventsResponse,
  AnalyticsFunnel,
} from "@/types/adminAnalytics";

/**
 * Admin analytics dashboard. Reads the three backend analytics endpoints via
 * our /api/admin/analytics/* proxies (same auth as the rest of the console) and
 * renders DAU, the conversion funnel, and per-event counts.
 *
 * The console renders outside the next-intl provider, so copy is Korean inline
 * (same convention as other admin screens). `day` from the backend is an ISO
 * UTC timestamp; we label it as a KST date (the bucket boundary stays UTC —
 * acceptable for trend reading, see 백엔드회신_콘솔_이벤트통계API.md §3).
 */

/** Format an ISO (UTC) day as a KST `M/D` label. */
function kstDayLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", {
    month: "numeric",
    day: "numeric",
    timeZone: "Asia/Seoul",
  });
}

/** Default range: the last 30 days as YYYY-MM-DD (UTC). */
function defaultRange(): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  const fromDate = new Date(now);
  fromDate.setUTCDate(fromDate.getUTCDate() - 29);
  const from = fromDate.toISOString().slice(0, 10);
  return { from, to };
}

const FUNNEL_STEPS: { key: keyof AnalyticsFunnel; label: string }[] = [
  { key: "visited", label: "방문" },
  { key: "signedUp", label: "가입완료" },
  { key: "gapViewed", label: "Gap진입" },
  { key: "premiumBlocked", label: "Premium제한" },
  { key: "subPageViewed", label: "구독페이지" },
  { key: "subscribeClicked", label: "결제버튼" },
  { key: "activated", label: "구독활성화" },
];

export function AnalyticsClient() {
  const init = useMemo(defaultRange, []);
  const [from, setFrom] = useState(init.from);
  const [to, setTo] = useState(init.to);

  const [dau, setDau] = useState<AnalyticsDauResponse["rows"]>([]);
  const [funnelRows, setFunnelRows] = useState<AnalyticsFunnelResponse["rows"]>([]);
  const [events, setEvents] = useState<AnalyticsEventsResponse["rows"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const qs = `?from=${from}&to=${to}`;
    const [dauRes, funnelRes, eventsRes] = await Promise.all([
      adminFetch<AnalyticsDauResponse>(`/api/admin/analytics/dau${qs}`),
      adminFetch<AnalyticsFunnelResponse>(`/api/admin/analytics/funnel${qs}`),
      adminFetch<AnalyticsEventsResponse>(`/api/admin/analytics/events${qs}`),
    ]);
    if (!dauRes.ok || !funnelRes.ok || !eventsRes.ok) {
      setError(
        dauRes.message ??
          funnelRes.message ??
          eventsRes.message ??
          "통계를 불러오지 못했습니다."
      );
      setLoading(false);
      return;
    }
    setDau(dauRes.data?.rows ?? []);
    setFunnelRows(funnelRes.data?.rows ?? []);
    setEvents(eventsRes.data?.rows ?? []);
    setLoading(false);
  }, [from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  // DAU line: oldest → newest, with KST labels.
  const dauChart = useMemo(
    () =>
      [...dau]
        .reverse()
        .map((r) => ({
          day: kstDayLabel(r.day),
          loggedInUsers: r.loggedInUsers,
          totalEvents: r.totalEvents,
        })),
    [dau]
  );

  // Funnel total across the selected range (sum of daily rows).
  const funnelTotal = useMemo(() => {
    const sum = (k: keyof AnalyticsFunnel) =>
      funnelRows.reduce((acc, r) => acc + (r[k] ?? 0), 0);
    return FUNNEL_STEPS.map((s) => ({ label: s.label, value: sum(s.key) }));
  }, [funnelRows]);

  // Event counts aggregated across the range, descending.
  const eventTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of events) {
      map.set(r.eventName, (map.get(r.eventName) ?? 0) + r.count);
    }
    return Array.from(map.entries())
      .map(([eventName, count]) => ({ eventName, count }))
      .sort((a, b) => b.count - a.count);
  }, [events]);

  return (
    <div className="flex flex-col gap-8">
      {/* Date range */}
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm text-muted">
          시작일
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-foreground"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted">
          종료일
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
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
        <span className="text-xs text-muted">
          ※ 날짜 경계는 UTC 기준입니다 (KST 0~9시는 전날에 포함될 수 있음).
        </span>
      </div>

      {error && <p className="text-sm text-down">{error}</p>}

      {/* DAU */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-foreground">
          일별 활성 유저 / 이벤트량
        </h2>
        <div className="h-72 rounded-xl border border-border bg-surface p-4">
          {dauChart.length === 0 ? (
            <p className="text-sm text-muted">데이터가 없습니다.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dauChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="loggedInUsers"
                  name="로그인 유저"
                  stroke="#3b82f6"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="totalEvents"
                  name="총 이벤트"
                  stroke="#10b981"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Funnel */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-foreground">
          전환 퍼널 (기간 합계)
        </h2>
        <div className="h-72 rounded-xl border border-border bg-surface p-4">
          {funnelTotal.every((s) => s.value === 0) ? (
            <p className="text-sm text-muted">데이터가 없습니다.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelTotal}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" name="건수" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <p className="text-xs text-muted">
          구독활성화는 백엔드 확정본(source=paypal_webhook)만 집계됩니다.
        </p>
      </section>

      {/* Event counts table */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-foreground">이벤트별 건수</h2>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-muted">
              <tr>
                <th className="px-4 py-2 text-left font-medium">이벤트</th>
                <th className="px-4 py-2 text-right font-medium">건수</th>
              </tr>
            </thead>
            <tbody>
              {eventTotals.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-muted">
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                eventTotals.map((r) => (
                  <tr key={r.eventName} className="border-t border-border">
                    <td className="px-4 py-2 text-foreground">{r.eventName}</td>
                    <td className="px-4 py-2 text-right text-foreground">
                      {r.count.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
