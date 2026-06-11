"use client";

import { NewsCategory } from "@/types/news";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface Tab {
  id: NewsCategory;
  labelKey: string;
}

const TABS: Tab[] = [
  { id: "news", labelKey: "news.typeNews" },
  { id: "disclosure", labelKey: "news.typeDisclosures" },
];

interface Props {
  active: NewsCategory;
  onChange: (category: NewsCategory) => void;
}

/** Top-level content-type tabs: News vs Disclosures. */
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
