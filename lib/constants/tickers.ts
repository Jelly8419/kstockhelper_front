import { TickerLabel, TickerMeta } from "@/types/news";

/** Ticker filter metadata, drives the filter tabs. */
export const TICKERS: TickerMeta[] = [
  { id: "samsung", label: "Samsung" },
  { id: "skhynix", label: "SK Hynix" },
  { id: "hyundai", label: "Hyundai" },
];

/** Map ticker id → short display label. */
export const TICKER_LABEL: Record<TickerLabel, string> = {
  samsung: "Samsung",
  skhynix: "SK Hynix",
  hyundai: "Hyundai",
};

const VALID: ReadonlySet<string> = new Set<TickerLabel>([
  "samsung",
  "skhynix",
  "hyundai",
]);

/** Keep only known ticker labels from a raw stock_ids array. */
export function toTickerLabels(stockIds: string[] | null | undefined): TickerLabel[] {
  if (!stockIds) return [];
  return stockIds.filter((s): s is TickerLabel => VALID.has(s));
}
