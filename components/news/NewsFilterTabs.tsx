"use client";

import { NewsFilter } from "@/types/news";
import { TICKERS } from "@/lib/mock/newsData";

interface Tab {
  id: NewsFilter;
  label: string;
}

const TABS: Tab[] = [
  { id: "all", label: "All" },
  ...TICKERS.map((t) => ({ id: t.id, label: t.label })),
];

interface Props {
  active: NewsFilter;
  onChange: (filter: NewsFilter) => void;
}

export function NewsFilterTabs({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="News filter">
      {TABS.map((tab) => {
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
