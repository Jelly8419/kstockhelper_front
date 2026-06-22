"use client";

import { Link } from "@/lib/i18n/navigation";
import { NewsPreview } from "@/types/news";
import { TICKER_LABEL } from "@/lib/constants/tickers";
import { Badge } from "@/components/ui/Badge";
import { formatRegisteredTime, withEllipsis } from "@/lib/utils/format";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { buildDetailPath } from "@/lib/utils/slug";
import { useTrackEvent } from "@/lib/analytics/useTrackEvent";

interface Props {
  item: NewsPreview;
}

export function NewsCard({ item }: Props) {
  const { t } = useTranslation();
  const track = useTrackEvent();
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
        {withEllipsis(item.preview)}
      </p>
    </>
  );

  // Every tier navigates to detail — gating happens on the detail page, not here
  // (guests/free see a public header + locked panel). Routes to /news/ or
  // /disclosures/ by category with the `{seqId}-{slug}` SEO path.
  const href = buildDetailPath(item.category, item.seqId, item.slug, item.title);
  return (
    <Link
      href={href}
      className={cardClass}
      onClick={() =>
        track("home_news_contents_clicked", {
          content_id: item.seqId,
          content_type: item.category,
        })
      }
    >
      {content}
    </Link>
  );
}
