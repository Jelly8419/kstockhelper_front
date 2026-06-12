"use client";

import { NewsPreview } from "@/types/news";
import { TICKER_LABEL } from "@/lib/constants/tickers";
import { Badge } from "@/components/ui/Badge";
import { formatRegisteredTime } from "@/lib/utils/format";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * Always-public detail header (SEO PRD §6, §13): title, related-stock labels,
 * published time, source, and the short summary (`preview`). Rendered for every
 * visitor — guest, free, and premium — so non-logged-in users and crawlers can
 * understand the page. The locked premium body lives separately in `NewsDetail`.
 *
 * Takes a `NewsPreview` (the public field set) so it never depends on gated
 * detail fields.
 */
export function NewsPublicHeader({ item }: { item: NewsPreview }) {
  const { t } = useTranslation();
  const relatedLabels = item.tickers.map((ticker) => TICKER_LABEL[ticker]);

  return (
    <header className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {item.tickers.map((ticker) => (
          <Badge key={ticker} tone="brand">
            {TICKER_LABEL[ticker]}
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

      <h1 className="text-2xl font-semibold leading-tight text-foreground">
        {item.title}
      </h1>

      {/* Source + related-stocks label (text, not URL path — PRD §4). */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        {item.source && <span>{item.source}</span>}
        {relatedLabels.length > 0 && (
          <span>
            {t("seo.relatedStocks")}: {relatedLabels.join(", ")}
          </span>
        )}
      </div>

      {/* Short summary — always public so guests/crawlers get a real preview. */}
      {item.preview && (
        <p className="text-base leading-relaxed text-foreground">
          {item.preview}
        </p>
      )}
    </header>
  );
}
