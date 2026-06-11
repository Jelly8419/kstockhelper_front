"use client";

import { NewsFilter } from "@/types/news";
import { TICKERS } from "@/lib/constants/tickers";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface Tab {
  id: NewsFilter;
  /** Ticker label (a data value, not translated). "all" uses an i18n key instead. */
  label: string;
}

// Ticker labels are stock symbols (data), so they are NOT translated. Only the
// leading "All" tab is a UI string, resolved via i18n in render.
const TICKER_TABS: Tab[] = TICKERS.map((t) => ({ id: t.id, label: t.label }));

interface Props {
  active: NewsFilter;
  onChange: (filter: NewsFilter) => void;
}

export function NewsFilterTabs({ active, onChange }: Props) {
  const { t } = useTranslation();
  const tabs: { id: NewsFilter; label: string }[] = [
    { id: "all", label: t("news.filterAll") },
    ...TICKER_TABS,
  ];

  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label={t("news.ariaFilter")}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`h-9 rounded-lg px-4 text-sm font-medium transition-colors ${
              isActive
                ? "bg-brand text-white"
                : "border border-border bg-surface text-muted hover:bg-surface-hover"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
