"use client";

import { Link } from "@/lib/i18n/navigation";
import { NewsPreview } from "@/types/news";
import { TICKER_LABEL } from "@/lib/constants/tickers";
import { Badge } from "@/components/ui/Badge";
import { formatRegisteredTime } from "@/lib/utils/format";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { buildDetailPath } from "@/lib/utils/slug";

interface Props {
  item: NewsPreview;
}

export function NewsCard({ item }: Props) {
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

  // Every tier navigates to detail — gating happens on the detail page, not here
  // (guests/free see a public header + locked panel). Routes to /news/ or
  // /disclosures/ by category with the `{seqId}-{slug}` SEO path.
  const href = buildDetailPath(item.category, item.seqId, item.slug, item.title);
  return (
    <Link href={href} className={cardClass}>
      {content}
    </Link>
  );
}
