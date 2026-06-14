"use client";

import type { PriceGapLatest } from "@/types/priceGap";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { formatNumber } from "@/lib/utils/format";
import { kstDateTime } from "@/lib/utils/kst";

/**
 * Top status bar (mockup): Korea Market open/closed + hours, USDT/KRW rate,
 * Total Stocks, and Last updated. The reference rate is USDT/KRW (Upbit), not a
 * bank USD/KRW rate.
 */
export function StatusCards({
  data,
  tier,
}: {
  data: PriceGapLatest | null;
  tier: "free" | "premium";
}) {
  const { t } = useTranslation();
  const open = data?.marketOpen ?? false;

  return (
    <div className="flex flex-wrap items-start justify-between gap-6 border-b border-border pb-4">
      <div className="flex flex-wrap items-start gap-8">
        {/* Korea Market */}
        <div>
          <p className="text-xs text-muted">{t("priceGap.status.koreaMarket")}</p>
          <p
            className={`text-lg font-semibold ${
              open ? "text-up" : "text-muted"
            }`}
          >
            {open ? t("priceGap.status.open") : t("priceGap.status.closed")}
          </p>
          <p className="text-xs text-muted">{t("priceGap.status.hours")}</p>
        </div>

        {/* USDT/KRW */}
        <div>
          <p className="text-xs text-muted">{t("priceGap.status.usdtKrw")}</p>
          <p className="text-lg font-semibold text-foreground">
            {data?.usdtKrw ? formatNumber(data.usdtKrw.price, 2) : "—"}
          </p>
          {data?.usdtKrw?.stale && (
            <p className="text-xs text-down">{t("priceGap.status.fxDelayed")}</p>
          )}
        </div>
      </div>

      {/* Last updated */}
      <div className="text-right">
        <p className="text-xs text-muted">
          {t("priceGap.status.lastUpdated")}{" "}
          {data ? kstDateTime(data.serverTime) : "—"}
        </p>
        {tier === "free" && (
          <p className="text-xs text-muted">
            {t("priceGap.status.updated.delayed")}
          </p>
        )}
      </div>
    </div>
  );
}
