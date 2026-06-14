import type {
  ApiEnvelope,
  Exchange,
  StockCode,
  PriceGapLatest,
  PriceGapChart,
} from "@/types/priceGap";

/**
 * Client → BFF only. The browser calls our own Next API routes
 * (`/api/price-gap/*`); those decide the tier from the session and proxy to the
 * backend (frontend-guide §"BFF"). The browser never sends `?tier=` and never
 * talks to the backend directly, so the tier can't be forged.
 */

async function getData<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || !json.success) {
    throw new Error(json.code || `price-gap ${res.status}`);
  }
  return json.data;
}

/** Latest table snapshot (6 rows = 3 stocks × 2 exchanges). Tier set by the BFF. */
export function fetchPriceGapLatest(): Promise<PriceGapLatest> {
  return getData<PriceGapLatest>(`/api/price-gap/latest`);
}

/** 1-minute OHLC for ONE stock × ONE exchange; multi-stock = N calls merged client-side. */
export function fetchPriceGapChart(
  exchange: Exchange,
  stock: StockCode
): Promise<PriceGapChart> {
  return getData<PriceGapChart>(
    `/api/price-gap/chart?exchange=${exchange}&stock=${stock}`
  );
}
