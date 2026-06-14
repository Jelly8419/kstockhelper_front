"use client";

import type { Exchange, StockCode } from "@/types/priceGap";
import { PRICE_GAP_STOCKS } from "@/types/priceGap";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { STOCK_COLORS } from "./colors";

const EXCHANGES: Exchange[] = ["binance", "bybit"];

/**
 * Chart-only filters (mockup): exchange = single select (default Binance),
 * stocks = multi select (default all 3, at least 1 must stay selected). These
 * drive the chart only; the table always shows everything.
 */
export function ChartFilters({
  exchange,
  onExchange,
  stocks,
  onStocks,
}: {
  exchange: Exchange;
  onExchange: (e: Exchange) => void;
  stocks: StockCode[];
  onStocks: (s: StockCode[]) => void;
}) {
  const { t } = useTranslation();

  const toggleStock = (code: StockCode) => {
    if (stocks.includes(code)) {
      // Enforce at least one selected.
      if (stocks.length === 1) return;
      onStocks(stocks.filter((c) => c !== code));
    } else {
      onStocks([...stocks, code]);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Exchange — single select segmented control */}
      <div className="flex items-center gap-1">
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

      {/* Stocks — multi select checkboxes */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted">
          {t("priceGap.filters.stocks")}
        </span>
        {PRICE_GAP_STOCKS.map(({ code, name }) => {
          const checked = stocks.includes(code);
          const lastOne = checked && stocks.length === 1;
          return (
            <label
              key={code}
              className={`flex items-center gap-1.5 rounded-lg border border-border px-2 py-1 text-sm ${
                lastOne ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={lastOne}
                onChange={() => toggleStock(code)}
                className="h-3.5 w-3.5 accent-brand"
              />
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: STOCK_COLORS[code] }}
              />
              {name}
            </label>
          );
        })}
      </div>
    </div>
  );
}
