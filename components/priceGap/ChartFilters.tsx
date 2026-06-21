"use client";

import type { AveragePeriod, Exchange, StockCode } from "@/types/priceGap";
import { AVERAGE_PERIODS, PRICE_GAP_STOCKS } from "@/types/priceGap";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useTrackEvent } from "@/lib/analytics/useTrackEvent";

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
  const track = useTrackEvent();

  // Only log when the value actually changes (ignore re-selecting the current).
  const changeStock = (next: StockCode) => {
    if (next !== stock) track("gap_stock_changed", { stock: next, prev_stock: stock });
    onStock(next);
  };
  const changeExchange = (next: Exchange) => {
    if (next !== exchange) {
      track("gap_exchange_changed", { exchange: next, prev_exchange: exchange });
    }
    onExchange(next);
  };
  const changePeriod = (next: AveragePeriod) => {
    if (next !== period) {
      track("gap_avg_period_changed", { period: next, prev_period: period });
    }
    onPeriod(next);
  };

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
              onClick={() => changeStock(code)}
              className={`px-3 py-1 text-sm transition-colors ${
                stock === code
                  ? "bg-brand text-white"
                  : "bg-transparent text-muted hover:bg-surface-hover"
              }`}
            >
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
              onClick={() => changeExchange(ex)}
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
          onChange={(e) => changePeriod(Number(e.target.value) as AveragePeriod)}
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
          className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
            showAvg ? "bg-brand" : "bg-border"
          }`}
        >
          <span
            className={`absolute left-0.5 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white transition-transform ${
              showAvg ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </label>
    </div>
  );
}
