"use client";

import { TickerLabel } from "@/types/news";
import { TICKERS } from "@/lib/constants/tickers";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface Props {
  /** Selected companies. Empty array = "All" (no company filter). */
  active: TickerLabel[];
  /** Toggle a single company. */
  onToggle: (ticker: TickerLabel) => void;
  /** Reset to "All" (clears the selection). */
  onReset: () => void;
}

/**
 * Company filter — multi-select with OR matching. "All" (empty selection)
 * clears the filter; clicking it again does nothing (no deselect). Toggling a
 * company adds/removes it; clearing the last one falls back to "All".
 */
export function NewsFilterTabs({ active, onToggle, onReset }: Props) {
  const { t } = useTranslation();
  const allActive = active.length === 0;

  const btn = "h-9 rounded-lg px-4 text-sm font-medium transition-colors";
  const activeCls = "bg-brand text-white";
  const idleCls =
    "border border-border bg-surface text-muted hover:bg-surface-hover";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-medium text-muted">
        {t("news.filterCompany")}
      </span>

      <button
        type="button"
        role="tab"
        aria-selected={allActive}
        onClick={onReset}
        className={`${btn} ${allActive ? activeCls : idleCls}`}
      >
        {t("news.filterAll")}
      </button>

      {TICKERS.map((ticker) => {
        const isActive = active.includes(ticker.id);
        return (
          <button
            key={ticker.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-pressed={isActive}
            onClick={() => onToggle(ticker.id)}
            className={`${btn} ${isActive ? activeCls : idleCls}`}
          >
            {ticker.label}
          </button>
        );
      })}
    </div>
  );
}
