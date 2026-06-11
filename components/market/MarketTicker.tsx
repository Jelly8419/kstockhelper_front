"use client";

import { useMarketData } from "@/lib/hooks/useMarketData";
import { MarketCard } from "./MarketCard";
import { formatRegisteredTime } from "@/lib/utils/format";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function MarketTicker() {
  const { items, lastUpdated } = useMarketData();
  const { t } = useTranslation();

  return (
    <section aria-label={t("market.ariaOverview")} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          {t("market.overview")}
        </h2>
        {lastUpdated && (
          <span className="text-xs text-muted">
            {t("market.updated", { time: formatRegisteredTime(lastUpdated) })}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <MarketCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
