"use client";

import { useEffect, useState } from "react";
import { MarketItem } from "@/types/market";
import { MOCK_MARKET } from "@/lib/mock/marketData";

const REFRESH_MS = 5 * 60 * 1000; // PRD: refresh every 5 minutes

interface UseMarketData {
  items: MarketItem[];
  lastUpdated: Date | null;
  isLoading: boolean;
}

/**
 * Provides market board data.
 * Currently returns mock data and sets up the 5-minute refresh loop.
 *
 * TODO (backend): replace fetchMarket() with the real API call, and
 * gate refreshing to weekdays 09:00–15:35 KST (freeze at last value after close).
 */
async function fetchMarket(): Promise<MarketItem[]> {
  // TODO: real API call. For now, return mock data.
  return MOCK_MARKET;
}

export function useMarketData(): UseMarketData {
  const [items, setItems] = useState<MarketItem[]>(MOCK_MARKET);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchMarket();
        if (!active) return;
        setItems(data);
        setLastUpdated(new Date());
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
