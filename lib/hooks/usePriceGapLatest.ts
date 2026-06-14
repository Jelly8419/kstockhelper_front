"use client";

import { useEffect, useRef, useState } from "react";
import type { UserTier } from "@/types/user";
import type { PriceGapLatest } from "@/types/priceGap";
import { fetchPriceGapLatest } from "@/lib/api/priceGap";

/**
 * Polling interval per tier (frontend-prd §2). Basic is configurable so traffic
 * can be throttled without a code change.
 */
const INTERVAL_MS: Record<"premium" | "basic", number> = {
  premium: 2000,
  basic: Number(process.env.NEXT_PUBLIC_PRICE_GAP_BASIC_MS) || 5000,
};

interface UsePriceGapLatest {
  data: PriceGapLatest | null;
  /** Previous poll's snapshot, for up/down coloring. */
  prev: PriceGapLatest | null;
  isLoading: boolean;
}

/**
 * Polls the latest Price Gap snapshot. premium → realtime (tier=premium),
 * free → 10-min delayed (tier=basic). Keeps the previous snapshot so the table
 * can color KR/Exchange prices by direction vs the last poll (the backend does
 * not send direction).
 */
export function usePriceGapLatest(
  tier: Exclude<UserTier, "guest">
): UsePriceGapLatest {
  const apiTier = tier === "premium" ? "premium" : "basic";
  const [data, setData] = useState<PriceGapLatest | null>(null);
  const [prev, setPrev] = useState<PriceGapLatest | null>(null);
  const [isLoading, setLoading] = useState(true);
  const latestRef = useRef<PriceGapLatest | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const next = await fetchPriceGapLatest();
        if (!active) return;
        setPrev(latestRef.current);
        latestRef.current = next;
        setData(next);
      } catch {
        // Keep the last good data; a transient poll error shouldn't blank the UI.
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    const timer = setInterval(load, INTERVAL_MS[apiTier]);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [apiTier]);

  return { data, prev, isLoading };
}
