"use client";

import { useState } from "react";
import type { Exchange, StockCode } from "@/types/priceGap";
import { PRICE_GAP_STOCK_ORDER } from "@/types/priceGap";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { usePriceGapLatest } from "@/lib/hooks/usePriceGapLatest";
import { kstDateTime } from "@/lib/utils/kst";
import { StatusCards } from "./StatusCards";
import { PriceGapTable } from "./PriceGapTable";
import { DelayBadge } from "./DelayBadge";
import { ChartFilters } from "./ChartFilters";
import { PriceGapChart } from "./PriceGapChart";
import { PipButton } from "./PipButton";
import { PriceGapFooter } from "./PriceGapFooter";

/**
 * Price Gap Monitor body for logged-in, non-restricted users.
 *
 * Layout (mockup): status bar → table (always all 6 rows) → chart (header row
 * carries the Exchange/Stocks filters + PIP) → footer. The Exchange/Stocks
 * filters and PIP affect the CHART only; the table always shows every stock and
 * both exchanges.
 *
 * tier drives the delay: premium = realtime, free = 10-min delayed + PIP locked.
 */
export function PriceGapMonitor({ tier }: { tier: "free" | "premium" }) {
  const { t } = useTranslation();
  const { data, prev, isLoading } = usePriceGapLatest(tier);

  const [exchange, setExchange] = useState<Exchange>("binance");
  const [stocks, setStocks] = useState<StockCode[]>([
    ...PRICE_GAP_STOCK_ORDER,
  ]);

  const delayed = tier === "free";
  const marketClosed = data != null && !data.marketOpen;
  const warming = data?.warmingUp === true;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold text-foreground">
          {t("priceGap.title")}
        </h1>
      </div>

      {delayed && <DelayBadge />}

      <StatusCards data={data} tier={tier} />

      {marketClosed && (
        <p className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-muted">
          {t("priceGap.state.closed")}
          {data && ` · ${kstDateTime(data.serverTime)}`}
        </p>
      )}
      {warming && (
        <p className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-muted">
          {t("priceGap.state.warmingUp")}
        </p>
      )}

      {/* 1) Table — not affected by filters; always all 6 rows (pivoted to 3). */}
      <PriceGapTable data={data} prev={prev} isLoading={isLoading} />

      {/* 2) Chart — header row holds title + Exchange/Stocks filters + PIP. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">
          {t("priceGap.chart.title")}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <ChartFilters
            exchange={exchange}
            onExchange={setExchange}
            stocks={stocks}
            onStocks={setStocks}
          />
          <PipButton tier={tier} data={data} exchange={exchange} stocks={stocks} />
        </div>
      </div>
      <PriceGapChart tier={tier} exchange={exchange} stocks={stocks} />

      <PriceGapFooter tier={tier} />
    </section>
  );
}
