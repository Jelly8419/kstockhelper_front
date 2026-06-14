/**
 * Price Gap Monitor — backend contract types.
 *
 * Source of truth: `k_stock_helper_md/프론트연동_PriceGapMonitor.md`
 * (branch `feature/price-gap-monitor`).
 *
 * The frontend only ever calls two polling endpoints and renders the result;
 * it never reads exchange/FX data directly. The reference rate is **USDT/KRW**
 * (Upbit), not a bank USD/KRW rate, so `usdRef` is in USDT terms:
 *   Reference Price (USDT) = KR Price / (USDT/KRW)
 */

export type Exchange = "binance" | "bybit";
export type StockCode = "005930" | "000660" | "005380";

/** Tier the frontend declares to the backend via `?tier=`. */
export type ApiTier = "premium" | "basic";

/** Standard API envelope shared with the rest of the app's `/api/*`. */
export interface ApiEnvelope<T> {
  success: boolean;
  code: string;
  data: T;
  message?: string;
}

/**
 * One latest-snapshot row = one stock × one exchange. The backend returns 6
 * rows (3 stocks × 2 exchanges); the table pivots them to 3 rows by stock.
 * Any value can be `null` when its source is unreceived/stale (notably while
 * the market is closed).
 */
export interface PriceGapRow {
  stockCode: StockCode;
  stockName: string;
  exchange: Exchange;
  /** KR Price (KRW), latest trade price. */
  krPrice: number | null;
  /** Reference Price (USDT) = krPrice / usdtKrw. */
  usdRef: number | null;
  /** Perp last price (USDT). */
  exPrice: number | null;
  /** Gap % = (exPrice - usdRef) / usdRef × 100. */
  gap: number | null;
  /** When this row was computed (epoch ms). */
  ts: number;
}

export interface PriceGapLatest {
  tier: ApiTier;
  /** Korea market hours + collector running. false → "Market Closed" UI. */
  marketOpen: boolean;
  /** Basic-only: server restarted, 10-min buffer not yet filled → rows may be empty. */
  warmingUp: boolean;
  /** USDT/KRW rate card. null when unavailable. */
  usdtKrw: { price: number; stale: boolean } | null;
  /** Response generation time (ISO); KST conversion is the frontend's job. */
  serverTime: string;
  rows: PriceGapRow[];
}

/** One 1-minute OHLC gap candle. Chart line uses `close_gap`; tooltip shows OHLC. */
export interface PriceGapCandle {
  /** Minute boundary (ISO, UTC) — chart x-axis. */
  timestamp_minute: string;
  stock_code: StockCode;
  stock_name: string;
  exchange: Exchange;
  open_gap: number;
  high_gap: number;
  low_gap: number;
  close_gap: number;
  /** Reserved for future stats; unused in MVP. */
  avg_gap: number | null;
}

export interface PriceGapChart {
  tier: ApiTier;
  exchange: Exchange;
  stock: StockCode;
  /** Ascending by time, up to 600 candles (~10h). */
  candles: PriceGapCandle[];
}

/** The three MVP stocks, in display order. */
export const PRICE_GAP_STOCKS: { code: StockCode; name: string }[] = [
  { code: "005930", name: "Samsung Electronics" },
  { code: "000660", name: "SK hynix" },
  { code: "005380", name: "Hyundai Motor" },
];

export const PRICE_GAP_STOCK_ORDER: StockCode[] = PRICE_GAP_STOCKS.map(
  (s) => s.code
);
