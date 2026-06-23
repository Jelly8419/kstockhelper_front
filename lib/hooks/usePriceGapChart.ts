"use client";

import { useEffect, useState } from "react";
import type { UserTier } from "@/types/user";
import type { AveragePeriod, Exchange, StockCode, PriceGapCandle } from "@/types/priceGap";
import { fetchPriceGapChart } from "@/lib/api/priceGap";

/** Chart polls slower than the table (frontend-prd §2). */
const INTERVAL_MS: Record<"premium" | "basic", number> = {
  premium: 7000,
  basic: 20000,
};

interface UsePriceGapChart {
  /** Ascending 1-minute OHLC + Avg Gap candles for the selected stock. */
  candles: PriceGapCandle[];
  isLoading: boolean;
}

/**
 * Polls 1-minute OHLC + selected-period Avg Gap for ONE stock × ONE exchange
 * (PRD §7: the chart is single-stock). Refetches when the exchange, stock,
 * period, or tier changes.
 */
export function usePriceGapChart(
  exchange: Exchange,
  stock: StockCode,
  period: AveragePeriod,
  tier: UserTier
): UsePriceGapChart {
  const apiTier = tier === "premium" ? "premium" : "basic";
  const [candles, setCandles] = useState<PriceGapCandle[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const res = await fetchPriceGapChart(exchange, stock, period).catch(
        () => null
      );
      if (!active) return;
      if (res) setCandles(res.candles);
      setLoading(false);
    };

    setLoading(true);
    load();
    const timer = setInterval(load, INTERVAL_MS[apiTier]);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [exchange, stock, period, apiTier]);

  return { candles, isLoading };
}
