import { createClient } from "@/lib/supabase/client";
import { MarketItem, MarketDataRow } from "@/types/market";

/**
 * Symbol → display metadata (English name + stable id + unit).
 * Also defines the board display order.
 */
const SYMBOL_META: Record<
  string,
  { id: string; name: string; unit?: string }
> = {
  "^KS11": { id: "kospi", name: "KOSPI" },
  "^KQ11": { id: "kosdaq", name: "KOSDAQ" },
  "KRW=X": { id: "usdkrw", name: "USD/KRW" },
  "005930.KS": { id: "samsung", name: "Samsung Electronics", unit: "KRW" },
  "000660.KS": { id: "skhynix", name: "SK hynix", unit: "KRW" },
  "005380.KS": { id: "hyundai", name: "Hyundai Motor", unit: "KRW" },
};

/** Board display order (by symbol). */
const ORDER = ["^KS11", "^KQ11", "KRW=X", "005930.KS", "000660.KS", "005380.KS"];

function mapRow(row: MarketDataRow): MarketItem {
  const meta = SYMBOL_META[row.symbol];
  return {
    id: meta?.id ?? row.symbol,
    name: meta?.name ?? row.name,
    kind: row.type,
    value: row.price,
    change: row.change,
    changeRate: row.change_percent,
    unit: meta?.unit,
  };
}

export interface MarketSnapshot {
  items: MarketItem[];
  /** Most recent updated_at across all rows (ISO), or null. */
  lastUpdated: string | null;
}

/** Fetch the latest market board data, in display order. */
export async function getMarketData(): Promise<MarketSnapshot> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("market_data")
    .select("symbol,name,type,price,change,change_percent,updated_at");

  if (error || !data) {
    console.error("getMarketData error:", error?.message);
    return { items: [], lastUpdated: null };
  }

  const rows = data as MarketDataRow[];

  // Order by the predefined board order; unknown symbols go to the end.
  const sorted = [...rows].sort(
    (a, b) =>
      (ORDER.indexOf(a.symbol) + 1 || 99) - (ORDER.indexOf(b.symbol) + 1 || 99)
  );

  const lastUpdated =
    rows.reduce<string | null>((latest, r) => {
      if (!latest || r.updated_at > latest) return r.updated_at;
      return latest;
    }, null) ?? null;

  return { items: sorted.map(mapRow), lastUpdated };
}
