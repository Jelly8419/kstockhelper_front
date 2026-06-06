/** A single index, stock, or FX rate shown on the market ticker board. */
export interface MarketItem {
  /** Stable key derived from the symbol, e.g. "samsung", "kospi". */
  id: string;
  /** Display name (English), e.g. "KOSPI", "Samsung Electronics". */
  name: string;
  /** Index / stock / FX. */
  kind: "index" | "stock" | "fx";
  /** Current value (index points), price (KRW), or FX rate. */
  value: number;
  /** Absolute change vs previous close. Null when not provided (e.g. FX). */
  change: number | null;
  /** Percent change vs previous close. Null when not provided (e.g. FX). */
  changeRate: number | null;
  /** Optional unit label, e.g. "KRW" for stocks. */
  unit?: string;
}

/** Raw row shape returned by PostgREST from the market_data table. */
export interface MarketDataRow {
  symbol: string;
  name: string;
  type: "stock" | "index" | "fx";
  price: number;
  change: number | null;
  change_percent: number | null;
  updated_at: string;
}
