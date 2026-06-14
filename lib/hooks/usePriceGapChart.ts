"use client";

import { useEffect, useRef, useState } from "react";
import type { UserTier } from "@/types/user";
import type { Exchange, StockCode, PriceGapCandle } from "@/types/priceGap";
import { fetchPriceGapChart } from "@/lib/api/priceGap";

/** Chart polls slower than the table (frontend-prd §2). */
const INTERVAL_MS: Record<"premium" | "basic", number> = {
  premium: 7000,
  basic: 20000,
};

interface UsePriceGapChart {
  /** candles keyed by stock code (only selected stocks). */
  series: Partial<Record<StockCode, PriceGapCandle[]>>;
  isLoading: boolean;
}

/**
 * Polls 1-minute OHLC candles for the selected exchange × stocks. The contract
 * is one call per stock×exchange, so multi-stock selection fans out into N
 * parallel calls merged by stock code. Refetches when the exchange, the set of
 * selected stocks, or the tier changes.
 */
export function usePriceGapChart(
  exchange: Exchange,
  stocks: StockCode[],
  tier: Exclude<UserTier, "guest">
): UsePriceGapChart {
  const apiTier = tier === "premium" ? "premium" : "basic";
  const [series, setSeries] = useState<
    Partial<Record<StockCode, PriceGapCandle[]>>
  >({});
  const [isLoading, setLoading] = useState(true);
  const key = stocks.join(",");
  const stocksRef = useRef(stocks);
  stocksRef.current = stocks;

  useEffect(() => {
    let active = true;

    const load = async () => {
      const current = stocksRef.current;
      const results = await Promise.all(
        current.map((s) =>
          fetchPriceGapChart(exchange, s).catch(() => null)
        )
      );
      if (!active) return;
      const next: Partial<Record<StockCode, PriceGapCandle[]>> = {};
      results.forEach((r) => {
        if (r) next[r.stock] = r.candles;
      });
      setSeries(next);
      setLoading(false);
    };

    setLoading(true);
    load();
    const timer = setInterval(load, INTERVAL_MS[apiTier]);
    return () => {
      active = false;
      clearInterval(timer);
    };
    // key captures the selected-stock set; stocksRef reads the live value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exchange, key, apiTier]);

  return { series, isLoading };
}
