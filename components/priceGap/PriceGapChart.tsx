"use client";

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
import type { Exchange, StockCode, PriceGapCandle } from "@/types/priceGap";
import { PRICE_GAP_STOCKS } from "@/types/priceGap";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { usePriceGapChart } from "@/lib/hooks/usePriceGapChart";
import { kstTime } from "@/lib/utils/kst";
import { STOCK_COLORS } from "./colors";

/** A merged x-axis point: timestamp + each selected stock's close_gap. */
interface ChartPoint {
  t: number; // epoch ms (minute)
  label: string; // KST HH:mm
  [stock: string]: number | string;
}

/**
 * Merge per-stock candle series onto a shared, sorted minute axis. Each point
 * carries `close_gap` per selected stock (the line value) plus the full OHLC in
 * a side map for the tooltip.
 */
function mergeSeries(
  series: Partial<Record<StockCode, PriceGapCandle[]>>,
  stocks: StockCode[]
): { points: ChartPoint[]; ohlc: Map<string, PriceGapCandle> } {
  const byTime = new Map<number, ChartPoint>();
  const ohlc = new Map<string, PriceGapCandle>(); // key: `${t}:${stock}`

  for (const code of stocks) {
    for (const candle of series[code] ?? []) {
      const t = new Date(candle.timestamp_minute).getTime();
      const minute = Math.floor(t / 60000) * 60000;
      let point = byTime.get(minute);
      if (!point) {
        point = { t: minute, label: kstTime(minute) };
        byTime.set(minute, point);
      }
      point[code] = candle.close_gap;
      ohlc.set(`${minute}:${code}`, candle);
    }
  }

  const points = Array.from(byTime.values()).sort((a, b) => a.t - b.t);
  return { points, ohlc };
}

export function PriceGapChart({
  tier,
  exchange,
  stocks,
  /** Override the default fixed height (e.g. "h-full" inside the PiP window). */
  heightClass = "h-[320px]",
}: {
  tier: Exclude<UserTier, "guest">;
  exchange: Exchange;
  stocks: StockCode[];
  heightClass?: string;
}) {
  const { t } = useTranslation();
  const { series, isLoading } = usePriceGapChart(exchange, stocks, tier);
  const { points, ohlc } = mergeSeries(series, stocks);

  if (points.length === 0) {
    // Loading vs. genuinely empty (e.g. market closed → backend returns []).
    return (
      <div
        className={`flex ${heightClass} items-center justify-center rounded-xl border border-border`}
      >
        <p className="text-sm text-muted">
          {isLoading ? t("common.loading") : t("priceGap.chart.empty")}
        </p>
      </div>
    );
  }

  return (
    <div className={`${heightClass} w-full rounded-xl border border-border p-2`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 10, right: 48, bottom: 4, left: 0 }}>
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
          <Tooltip content={<OhlcTooltip ohlc={ohlc} stocks={stocks} />} />
          {stocks.map((code) => (
            <Line
              key={code}
              type="monotone"
              dataKey={code}
              stroke={STOCK_COLORS[code]}
              dot={false}
              strokeWidth={1.5}
              isAnimationActive={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Tooltip showing each selected stock's O/H/L/C gap for the hovered minute. */
function OhlcTooltip({
  active,
  payload,
  ohlc,
  stocks,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
  ohlc: Map<string, PriceGapCandle>;
  stocks: StockCode[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-foreground">{point.label}</p>
      {stocks.map((code) => {
        const candle = ohlc.get(`${point.t}:${code}`);
        if (!candle) return null;
        const name = PRICE_GAP_STOCKS.find((s) => s.code === code)?.name ?? code;
        return (
          <div key={code} className="mb-1 last:mb-0">
            <span
              className="mr-1 inline-block h-2 w-2 rounded-full align-middle"
              style={{ backgroundColor: STOCK_COLORS[code] }}
            />
            <span className="text-foreground">{name}</span>
            <span className="ml-2 text-muted">
              O {candle.open_gap.toFixed(2)} · H {candle.high_gap.toFixed(2)} · L{" "}
              {candle.low_gap.toFixed(2)} · C {candle.close_gap.toFixed(2)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
