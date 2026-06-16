"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { UserTier } from "@/types/user";
import type {
  AveragePeriod,
  Exchange,
  StockCode,
  PriceGapCandle,
} from "@/types/priceGap";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { usePriceGapChart } from "@/lib/hooks/usePriceGapChart";
import { localDate, localTime, localDateTime } from "@/lib/utils/localTime";
import { GAP_LINE_COLORS } from "./colors";

/** Min/max zoom window in minutes (PRD §9.3). */
const MIN_WINDOW = 30;

/** One chart point: a minute with its current close_gap and period avg gap. */
interface ChartPoint {
  t: number; // epoch ms (minute)
  label: string; // local HH:mm
  cur: number; // close_gap (Current Gap line)
  avg: number | null; // avgGap (Avg Gap line)
}

/**
 * Gap Tracker chart (PRD §7–§9): single stock × single exchange, showing the
 * Current Gap line and (when enabled) the selected-period Avg Gap line. The
 * x-axis is the viewer's local time; data is KST-based.
 *
 * Zoom/pan are custom (recharts has none): the wheel zooms toward the latest
 * point (wheel up = zoom in, down = zoom out), and horizontal drag pans. The
 * visible slice is a [start, end] index window into the full minute series,
 * clamped to [30min, whole session].
 */
export function PriceGapChart({
  tier,
  exchange,
  stock,
  period,
  showAvg,
  /**
   * Fixed chart height for the page (default). When `fill` is set the chart
   * instead grows to fill its parent (used inside the PiP window), so this is
   * ignored.
   */
  heightClass = "h-[320px]",
  /** Fill the parent's height instead of using a fixed height (PiP). */
  fill = false,
}: {
  tier: Exclude<UserTier, "guest">;
  exchange: Exchange;
  stock: StockCode;
  period: AveragePeriod;
  showAvg: boolean;
  heightClass?: string;
  fill?: boolean;
}) {
  const { t } = useTranslation();
  const { candles, isLoading } = usePriceGapChart(exchange, stock, period, tier);

  const points = useMemo<ChartPoint[]>(
    () =>
      candles.map((c) => {
        const t = new Date(c.timestamp_minute).getTime();
        return { t, label: localTime(t), cur: c.close_gap, avg: c.avgGap };
      }),
    [candles]
  );
  // OHLC + avg lookup for the tooltip, keyed by minute epoch.
  const byMinute = useMemo(() => {
    const m = new Map<number, PriceGapCandle>();
    for (const c of candles) m.set(new Date(c.timestamp_minute).getTime(), c);
    return m;
  }, [candles]);

  // Visible window as an index range into `points`. null = full range (auto).
  const [window, setWindow] = useState<[number, number] | null>(null);
  const dragRef = useRef<{ x: number; range: [number, number] } | null>(null);
  const [grabbing, setGrabbing] = useState(false);

  // The interaction container, used to register a non-passive wheel listener and
  // to size pan deltas against the chart width.
  const boxRef = useRef<HTMLDivElement | null>(null);

  // Mirror the latest count and window into refs so the imperative wheel/touch
  // handlers (registered once) always read current values without re-binding.
  const nRef = useRef(0);
  const windowRef = useRef<[number, number] | null>(null);
  windowRef.current = window;

  // Reset the window whenever the underlying series identity changes (stock/
  // exchange/period switch), so a new series always starts fully zoomed-out.
  useEffect(() => {
    setWindow(null);
  }, [stock, exchange, period]);

  const n = points.length;
  nRef.current = n;
  const range: [number, number] = window ?? [0, Math.max(0, n - 1)];
  const visible = n > 0 ? points.slice(range[0], range[1] + 1) : [];

  // anchored at the latest point (PRD §9.2): zoom keeps the right edge fixed.
  // Reads the live count/window from refs so it is safe to call from the
  // imperatively-bound wheel and touch handlers.
  const zoom = (factor: number) => {
    const count = nRef.current;
    if (count === 0) return;
    const [start, end] = windowRef.current ?? [0, count - 1];
    const span = end - start + 1;
    const nextSpan = Math.round(span * factor);
    const clamped = Math.min(Math.max(nextSpan, MIN_WINDOW), count);
    const nextStart = Math.max(0, end - clamped + 1);
    setWindow(nextStart === 0 && clamped === count ? null : [nextStart, end]);
  };

  // Shift the visible window by a fraction of its span (drag/swipe pan). Positive
  // `frac` (drag right) moves earlier in time; negative moves later.
  const pan = (
    frac: number,
    base: [number, number] = windowRef.current ?? [0, nRef.current - 1]
  ) => {
    const count = nRef.current;
    const [start, end] = base;
    const span = end - start + 1;
    if (span >= count) return; // fully zoomed out → nothing to pan
    const deltaMin = Math.round(frac * span);
    let nextStart = start - deltaMin;
    nextStart = Math.min(Math.max(nextStart, 0), count - span);
    setWindow([nextStart, nextStart + span - 1]);
  };

  // Wheel zoom via a non-passive native listener: React's onWheel is passive, so
  // its preventDefault is ignored and the page would scroll while zooming
  // (Price Gap revisions §9 PC). Bind once; the handler reads live refs.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const onWheel = (e: WheelEvent) => {
      if (nRef.current === 0) return;
      e.preventDefault(); // keep the page fixed while the cursor is over the chart
      zoom(e.deltaY < 0 ? 0.8 : 1.25); // up = zoom in, down = zoom out
    };
    box.addEventListener("wheel", onWheel, { passive: false });
    return () => box.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Mouse drag pan (PC). Touch is handled separately (pinch + swipe). ---
  const onPointerDown = (e: React.PointerEvent) => {
    if (n === 0 || e.pointerType === "touch") return;
    dragRef.current = { x: e.clientX, range };
    setGrabbing(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || n === 0) return;
    const width = boxRef.current?.clientWidth || 1;
    pan((e.clientX - drag.x) / width, drag.range);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current = null;
    setGrabbing(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  // --- Touch: 1 finger = horizontal swipe pan, 2 fingers = pinch zoom (mobile,
  // Price Gap revisions §9). Vertical drags fall through to page scroll because
  // the container uses touch-action: pan-y. ---
  const touchRef = useRef<{
    mode: "swipe" | "pinch";
    startX: number;
    range: [number, number];
    pinchDist: number;
    axisLocked: boolean;
    startY: number;
  } | null>(null);

  const touchDist = (a: React.Touch, b: React.Touch) =>
    Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

  const onTouchStart = (e: React.TouchEvent) => {
    if (n === 0) return;
    if (e.touches.length === 2) {
      touchRef.current = {
        mode: "pinch",
        startX: 0,
        range,
        pinchDist: touchDist(e.touches[0], e.touches[1]),
        axisLocked: true,
        startY: 0,
      };
    } else if (e.touches.length === 1) {
      touchRef.current = {
        mode: "swipe",
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        range,
        pinchDist: 0,
        axisLocked: false,
      };
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const tc = touchRef.current;
    if (!tc || n === 0) return;

    if (tc.mode === "pinch" && e.touches.length >= 2) {
      const dist = touchDist(e.touches[0], e.touches[1]);
      if (tc.pinchDist > 0) {
        // Pinch out (fingers apart) = zoom in (narrower window); pinch in = out.
        zoom(tc.pinchDist / dist);
      }
      tc.pinchDist = dist;
      e.preventDefault();
      return;
    }

    if (tc.mode === "swipe" && e.touches.length === 1) {
      const dx = e.touches[0].clientX - tc.startX;
      const dy = e.touches[0].clientY - tc.startY;
      // Lock to the horizontal axis on first decisive move; vertical swipes are
      // left to the browser (page scroll) and never pan the chart.
      if (!tc.axisLocked) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return; // below threshold
        if (Math.abs(dy) > Math.abs(dx)) {
          touchRef.current = null; // vertical → release to page scroll
          return;
        }
        tc.axisLocked = true;
      }
      const width = boxRef.current?.clientWidth || 1;
      pan(dx / width, tc.range);
      e.preventDefault(); // we own this horizontal gesture
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) touchRef.current = null;
  };

  if (n === 0) {
    return (
      <div
        className={`flex ${
          fill ? "h-full" : heightClass
        } items-center justify-center rounded-xl border border-border`}
      >
        <p className="text-sm text-muted">
          {isLoading ? t("common.loading") : t("priceGap.chart.empty")}
        </p>
      </div>
    );
  }

  const avgLabel = t("priceGap.chart.avgGapLine", { n: period });
  const todayLocal = localDate(points[n - 1].t);

  return (
    <div className={`flex flex-col gap-2 ${fill ? "h-full" : ""}`}>
      {/* Legend + today's local date */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span
              className="h-0.5 w-4 rounded"
              style={{ backgroundColor: GAP_LINE_COLORS.current }}
            />
            <span className="text-foreground">
              {t("priceGap.chart.currentGapLine")}
            </span>
          </span>
          {showAvg && (
            <span className="flex items-center gap-1.5">
              <span
                className="h-0.5 w-4 rounded"
                style={{ backgroundColor: GAP_LINE_COLORS.avg }}
              />
              <span className="text-foreground">{avgLabel}</span>
            </span>
          )}
        </div>
        <span className="text-muted">
          {t("priceGap.chart.date")} {todayLocal}
        </span>
      </div>

      <div
        ref={boxRef}
        className={`${
          fill ? "min-h-0 flex-1" : heightClass
        } w-full touch-pan-y rounded-xl border border-border p-2`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ cursor: grabbing ? "grabbing" : "grab" }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={visible}
            margin={{ top: 10, right: 48, bottom: 4, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--muted)" }}
              stroke="var(--border)"
              minTickGap={40}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted)" }}
              stroke="var(--border)"
              tickFormatter={(v: number) => `${v.toFixed(1)}%`}
              width={48}
            />
            <ReferenceLine y={0} stroke="var(--muted)" strokeDasharray="2 2" />
            <Tooltip
              content={<GapTooltip byMinute={byMinute} period={period} />}
            />
            <Line
              type="monotone"
              dataKey="cur"
              stroke={GAP_LINE_COLORS.current}
              dot={false}
              strokeWidth={1.8}
              isAnimationActive={false}
              connectNulls
            />
            {showAvg && (
              <Line
                type="monotone"
                dataKey="avg"
                stroke={GAP_LINE_COLORS.avg}
                dot={false}
                strokeWidth={1.4}
                isAnimationActive={false}
                connectNulls
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Signed "+0.23%p" / "−0.10%p" style for percentage-point deltas. */
function ppText(v: number): string {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%p`;
}

/** Price-gap convention (matches the table): positive = green, negative = red. */
function gapColorClass(v: number | null): string {
  if (v == null) return "text-muted";
  return v > 0 ? "text-gain" : v < 0 ? "text-up" : "text-muted";
}

/**
 * Unified tooltip for the hovered minute (PRD §8): local date/time, Current Gap
 * OHLC, the selected-period Avg Gap, and Gap vs Past Avg (= close_gap − avgGap).
 */
function GapTooltip({
  active,
  payload,
  byMinute,
  period,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
  byMinute: Map<number, PriceGapCandle>;
  period: AveragePeriod;
}) {
  const { t } = useTranslation();
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const candle = byMinute.get(point.t);
  if (!candle) return null;

  const avg = candle.avgGap;
  const vsAvg = avg != null ? candle.close_gap - avg : null;
  const avgLabel = t("priceGap.chart.avgGapLine", { n: period });

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="mb-1.5 font-medium text-foreground">
        {localDateTime(point.t)} {t("priceGap.chart.localTime")}
      </p>

      <p className="mb-0.5 flex items-center gap-1.5">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: GAP_LINE_COLORS.current }}
        />
        <span className="text-foreground">
          {t("priceGap.chart.currentGapLine")}
        </span>
      </p>
      <p className="mb-1.5 text-muted">
        {`O ${candle.open_gap.toFixed(2)} · H ${candle.high_gap.toFixed(
          2
        )} · L ${candle.low_gap.toFixed(2)} · C ${candle.close_gap.toFixed(2)}`}
      </p>

      <p className="mb-1 flex items-center justify-between gap-4">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: GAP_LINE_COLORS.avg }}
          />
          <span className="text-foreground">{avgLabel}</span>
        </span>
        <span className="text-muted">
          {avg != null ? `${avg.toFixed(2)}%` : "—"}
        </span>
      </p>

      <p className="flex items-center justify-between gap-4">
        <span className="text-foreground">
          {t("priceGap.chart.gapVsPastAvg")}
        </span>
        <span className={gapColorClass(vsAvg)}>
          {vsAvg != null ? ppText(vsAvg) : "—"}
        </span>
      </p>
    </div>
  );
}
