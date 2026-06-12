"use client";

import { Link } from "@/lib/i18n/navigation";
import { NewsPreview } from "@/types/news";
import { TICKER_LABEL } from "@/lib/constants/tickers";
import { Badge } from "@/components/ui/Badge";
import { formatRegisteredTime } from "@/lib/utils/format";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface Props {
  item: NewsPreview;
  /** When provided, intercepts the click instead of navigating (for gating). */
  onBlockedClick?: () => void;
}

export function NewsCard({ item, onBlockedClick }: Props) {
  const { t } = useTranslation();
  const cardClass =
    "flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 text-left transition-colors hover:bg-surface-hover";

  const content = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {item.tickers.map((t) => (
          <Badge key={t} tone="brand">
            {TICKER_LABEL[t]}
          </Badge>
        ))}
        <Badge tone="neutral">
          {item.category === "disclosure"
            ? t("news.badgeDisclosure")
            : t("news.badgeNews")}
        </Badge>
        <span className="ml-auto text-xs text-muted">
          {formatRegisteredTime(item.publishedAt)}
        </span>
      </div>

      <h3 className="text-base font-semibold leading-snug text-foreground">
        {item.title}
      </h3>

      <p className="line-clamp-3 text-sm leading-relaxed text-muted">
        {item.preview}
      </p>
    </>
  );

  // Non-premium: intercept click to show a gate modal.
  if (onBlockedClick) {
    return (
      <button type="button" onClick={onBlockedClick} className={cardClass}>
        {content}
      </button>
    );
  }

  // Premium: navigate to detail.
  return (
    <Link href={`/news/${item.id}`} className={cardClass}>
      {content}
    </Link>
  );
}
