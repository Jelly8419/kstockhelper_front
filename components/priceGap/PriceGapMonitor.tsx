"use client";

import { useState } from "react";
import type { AveragePeriod, Exchange, StockCode } from "@/types/priceGap";
import { DEFAULT_AVERAGE_PERIOD } from "@/types/priceGap";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { usePriceGapLatest } from "@/lib/hooks/usePriceGapLatest";
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

  // Chart-only controls (PRD §7): single stock, single exchange, avg period,
  // and the Avg Gap line toggle. Defaults: Samsung / Binance / 10D / ON.
  const [stock, setStock] = useState<StockCode>("005930");
  const [exchange, setExchange] = useState<Exchange>("binance");
  const [period, setPeriod] = useState<AveragePeriod>(DEFAULT_AVERAGE_PERIOD);
  const [showAvg, setShowAvg] = useState(true);

  const delayed = tier === "free";
  const warming = data?.warmingUp === true;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-foreground">
          {t("priceGap.title")}
        </h1>
        <div className="text-sm text-muted">
          <p className="font-bold text-foreground">
            {t("priceGap.subtitle.line1")}
          </p>
          <p>{t("priceGap.subtitle.line2")}</p>
        </div>
      </div>

      {delayed && <DelayBadge />}

      <StatusCards data={data} tier={tier} />

      {warming && (
        <p className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-muted">
          {t("priceGap.state.warmingUp")}
        </p>
      )}

      {/* 1) Table — not affected by filters; always all 6 rows (pivoted to 3). */}
      <PriceGapTable data={data} prev={prev} isLoading={isLoading} />

      {/* 2) Chart — header row holds title + chart controls + PIP. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">
          {t("priceGap.chart.title")}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <ChartFilters
            stock={stock}
            onStock={setStock}
            exchange={exchange}
            onExchange={setExchange}
            period={period}
            onPeriod={setPeriod}
            showAvg={showAvg}
            onShowAvg={setShowAvg}
          />
          <PipButton
            tier={tier}
            data={data}
            exchange={exchange}
            stock={stock}
            period={period}
            showAvg={showAvg}
          />
        </div>
      </div>
      <PriceGapChart
        tier={tier}
        exchange={exchange}
        stock={stock}
        period={period}
        showAvg={showAvg}
      />

      <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
        <p>{t("priceGap.chart.introLine1")}</p>
        <p>{t("priceGap.chart.introLine2")}</p>
      </div>

      <PriceGapFooter tier={tier} />
    </section>
  );
}
