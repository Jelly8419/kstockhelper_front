"use client";

import { ContentTypeFilter } from "@/types/news";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface Tab {
  id: ContentTypeFilter;
  labelKey: string;
}

const TABS: Tab[] = [
  { id: "all", labelKey: "news.filterAll" },
  { id: "news", labelKey: "news.typeNews" },
  { id: "disclosure", labelKey: "news.typeDisclosures" },
];

interface Props {
  active: ContentTypeFilter;
  onChange: (category: ContentTypeFilter) => void;
}

/** Top-level content-type tabs: All / News / Disclosures (single-select). */
export function NewsTypeTabs({ active, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div
      className="flex gap-1 border-b border-border"
      role="tablist"
      aria-label={t("news.ariaType")}
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
            {t(tab.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
