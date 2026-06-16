"use client";

import type { AveragePeriod, Exchange, StockCode } from "@/types/priceGap";
import { AVERAGE_PERIODS, PRICE_GAP_STOCKS } from "@/types/priceGap";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { STOCK_COLORS } from "./colors";

const EXCHANGES: Exchange[] = ["binance", "bybit"];

/**
 * Gap Tracker controls (PRD §7.3–§7.7). All drive the CHART only; the table
 * always shows every stock and both exchanges.
 *  - Stock   : single-select tabs (default Samsung)
 *  - Exchange: single-select segmented control (default Binance)
 *  - Period  : Avg Gap window 3/5/10/20/30D (default 10D)
 *  - ShowAvg : toggle the Avg Gap line (default ON)
 */
export function ChartFilters({
  stock,
  onStock,
  exchange,
  onExchange,
  period,
  onPeriod,
  showAvg,
  onShowAvg,
}: {
  stock: StockCode;
  onStock: (s: StockCode) => void;
  exchange: Exchange;
  onExchange: (e: Exchange) => void;
  period: AveragePeriod;
  onPeriod: (p: AveragePeriod) => void;
  showAvg: boolean;
  onShowAvg: (v: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      {/* Stock — single-select tabs */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted">{t("priceGap.filters.stock")}</span>
        <div className="flex overflow-hidden rounded-lg border border-border">
          {PRICE_GAP_STOCKS.map(({ code, name }) => (
            <button
              key={code}
              type="button"
              onClick={() => onStock(code)}
              className={`flex items-center gap-1.5 px-3 py-1 text-sm transition-colors ${
                stock === code
                  ? "bg-brand text-white"
                  : "bg-transparent text-muted hover:bg-surface-hover"
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: STOCK_COLORS[code] }}
              />
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Exchange — single-select segmented control */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted">
          {t("priceGap.filters.exchange")}
        </span>
        <div className="flex overflow-hidden rounded-lg border border-border">
          {EXCHANGES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => onExchange(ex)}
              className={`px-3 py-1 text-sm capitalize transition-colors ${
                exchange === ex
                  ? "bg-brand text-white"
                  : "bg-transparent text-muted hover:bg-surface-hover"
              }`}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Average Period — single-select dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted">
          {t("priceGap.filters.averagePeriod")}
        </span>
        <select
          value={period}
          onChange={(e) => onPeriod(Number(e.target.value) as AveragePeriod)}
          className="rounded-lg border border-border bg-transparent px-2 py-1 text-sm text-foreground"
        >
          {AVERAGE_PERIODS.map((p) => (
            <option key={p} value={p} className="bg-surface text-foreground">
              {t("priceGap.filters.dayAvg", { n: p })}
            </option>
          ))}
        </select>
      </div>

      {/* Show Avg Gap — toggle */}
      <label className="flex cursor-pointer items-center gap-2">
        <span className="text-xs text-muted">
          {t("priceGap.filters.showAvgGap")}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={showAvg}
          onClick={() => onShowAvg(!showAvg)}
          className={`relative h-5 w-9 rounded-full transition-colors ${
            showAvg ? "bg-brand" : "bg-border"
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
              showAvg ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </label>
    </div>
  );
}
