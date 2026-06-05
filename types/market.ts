/** A single index or stock shown on the market ticker board. */
export interface MarketItem {
  /** Stable key, e.g. "kospi", "samsung". */
  id: string;
  /** Display name, e.g. "KOSPI", "Samsung Electronics". */
  name: string;
  /** Whether this is a market index or an individual stock. */
  kind: "index" | "stock";
  /** Current value (index points) or price (KRW). */
  value: number;
  /** Absolute change vs previous close. */
  change: number;
  /** Percent change vs previous close, e.g. 1.23 for +1.23%. */
  changeRate: number;
  /** Optional unit label, e.g. "KRW" for stocks, undefined for indices. */
  unit?: string;
}
