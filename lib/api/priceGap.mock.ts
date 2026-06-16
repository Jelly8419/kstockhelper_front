import type {
  ApiTier,
  AveragePeriod,
  Exchange,
  StockCode,
  PriceGapLatest,
  PriceGapRow,
  PriceGapChart,
  PriceGapCandle,
} from "@/types/priceGap";
import { DEFAULT_AVERAGE_PERIOD, PRICE_GAP_STOCKS } from "@/types/priceGap";

/** KST minute-of-day (hour*60+min) for an epoch-ms instant. */
function kstMinuteOfDay(t: number): number {
  const kst = new Date(t + 9 * 60 * 60 * 1000); // shift to KST, read UTC parts
  return kst.getUTCHours() * 60 + kst.getUTCMinutes();
}

/**
 * In-repo mock for the Price Gap backend, used until
 * `feature/price-gap-monitor` is wired (NEXT_PUBLIC_PRICE_GAP_API unset).
 *
 * Values wobble over time so the UI's up/down coloring and live polling are
 * observable. Deterministic per call (seeded by wall-clock minute/second) —
 * no Math.random, so server/client renders stay consistent enough for dev.
 */

const USDT_KRW = 1352.4;

/** Base KRW price per stock (rough, for plausible numbers). */
const BASE_KR: Record<StockCode, number> = {
  "005930": 81_200,
  "000660": 203_000,
  "005380": 248_500,
};

/** A small deterministic oscillation in [-1, 1] from a seed. */
function wobble(seed: number): number {
  return Math.sin(seed);
}

function buildRow(
  code: StockCode,
  name: string,
  exchange: Exchange,
  t: number
): PriceGapRow {
  const seed = t / 5000 + code.charCodeAt(5) + (exchange === "bybit" ? 0.7 : 0);
  const krPrice = Math.round(BASE_KR[code] * (1 + wobble(seed) * 0.001));
  const usdRef = krPrice / USDT_KRW;
  // Gap centered slightly positive for samsung/hyundai, negative for hynix.
  const bias = code === "000660" ? -0.4 : code === "005380" ? 0.6 : 1.1;
  const gap = bias + wobble(seed * 1.3) * 0.3;
  const exPrice = usdRef * (1 + gap / 100);
  // Past Avg Gap drifts slowly around the bias (stands in for "all-history mean").
  const pastAvgGap = Number((bias + wobble(t / 600000 + code.charCodeAt(5)) * 0.15).toFixed(2));
  const gapNum = Number(gap.toFixed(2));
  return {
    stockCode: code,
    stockName: name,
    exchange,
    krPrice,
    usdRef: Number(usdRef.toFixed(2)),
    exPrice: Number(exPrice.toFixed(2)),
    gap: gapNum,
    pastAvgGap,
    gapVsPastAvg: Number((gapNum - pastAvgGap).toFixed(2)),
    ts: t,
  };
}

export function mockPriceGapLatest(tier: ApiTier): PriceGapLatest {
  const now = Date.now();
  // Basic data is 10 minutes behind.
  const t = tier === "premium" ? now : now - 10 * 60 * 1000;

  const rows: PriceGapRow[] = [];
  for (const { code, name } of PRICE_GAP_STOCKS) {
    rows.push(buildRow(code, name, "binance", t));
    rows.push(buildRow(code, name, "bybit", t));
  }

  return {
    tier,
    marketOpen: true,
    warmingUp: false,
    usdtKrw: { price: USDT_KRW, stale: false },
    serverTime: new Date(t).toISOString(),
    rows,
  };
}

export function mockPriceGapChart(
  exchange: Exchange,
  stock: StockCode,
  tier: ApiTier,
  period: AveragePeriod = DEFAULT_AVERAGE_PERIOD
): PriceGapChart {
  const now = Date.now();
  const end = tier === "premium" ? now : now - 10 * 60 * 1000;
  const minute = 60 * 1000;
  const candles: PriceGapCandle[] = [];
  const name = PRICE_GAP_STOCKS.find((s) => s.code === stock)?.name ?? stock;
  const bias = stock === "000660" ? -0.4 : stock === "005380" ? 0.6 : 1.1;
  // Shorter periods sit closer to the live line; longer periods smooth toward bias.
  const avgPull = 1 - Math.min(period, 30) / 40; // 3D≈0.93 … 30D≈0.25

  // Last ~120 minutes of 1m candles. Slow drift (sin over ~40min) + tiny noise
  // so the line reads as a trend, not a sawtooth.
  for (let i = 120; i >= 0; i--) {
    const ts = Math.floor((end - i * minute) / minute) * minute;
    const m = ts / 60000;
    const phase = stock.charCodeAt(5) + (exchange === "bybit" ? 0.4 : 0);
    const drift = wobble(m / 40 + phase) * 0.6; // slow trend
    const c = bias + drift;
    const o = bias + wobble((m - 1) / 40 + phase) * 0.6;
    const hi = Math.max(o, c) + 0.05;
    const lo = Math.min(o, c) - 0.05;
    // Avg line: a smoothed version of the live gap, pulled toward bias by period.
    const avg = bias + drift * avgPull * 0.5;
    candles.push({
      timestamp_minute: new Date(ts).toISOString(),
      stock_code: stock,
      stock_name: name,
      exchange,
      open_gap: Number(o.toFixed(2)),
      high_gap: Number(hi.toFixed(2)),
      low_gap: Number(lo.toFixed(2)),
      close_gap: Number(c.toFixed(2)),
      avg_gap: null,
      minuteOfDay: kstMinuteOfDay(ts),
      avgGap: Number(avg.toFixed(2)),
      availableDays: period,
    });
  }

  return { tier, exchange, stock, period, candles };
}
