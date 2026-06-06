"use client";

import { useEffect, useState } from "react";
import { MarketItem } from "@/types/market";
import { getMarketData } from "@/lib/api/market";

const REFRESH_MS = 5 * 60 * 1000; // PRD: refresh every 5 minutes

interface UseMarketData {
  items: MarketItem[];
  /** Latest updated_at from the data (ISO), or null. */
  lastUpdated: string | null;
  isLoading: boolean;
}

/**
 * Provides market board data from the market_data table, refreshing every
 * 5 minutes. The backend gates collection to market hours, so off-hours the
 * data simply stays at the last value (no extra client-side gating needed).
 */
export function useMarketData(): UseMarketData {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const { items, lastUpdated } = await getMarketData();
        if (!active) return;
        setItems(items);
        setLastUpdated(lastUpdated);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    load();
    const timer = setInterval(load, REFRESH_MS);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return { items, lastUpdated, isLoading };
}
