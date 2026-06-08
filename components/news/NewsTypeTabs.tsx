"use client";

import { NewsCategory } from "@/types/news";

interface Tab {
  id: NewsCategory;
  label: string;
}

const TABS: Tab[] = [
  { id: "news", label: "News" },
  { id: "disclosure", label: "Disclosures" },
];

interface Props {
  active: NewsCategory;
  onChange: (category: NewsCategory) => void;
}

/** Top-level content-type tabs: News vs Disclosures. */
export function NewsTypeTabs({ active, onChange }: Props) {
  return (
    <div
      className="flex gap-1 border-b border-border"
      role="tablist"
      aria-label="Content type"
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`-mb-px h-10 px-4 text-sm font-semibold transition-colors ${
              isActive
                ? "border-b-2 border-brand text-foreground"
                : "border-b-2 border-transparent text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
