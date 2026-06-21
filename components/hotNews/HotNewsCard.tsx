"use client";

import { Link } from "@/lib/i18n/navigation";
import { TICKER_LABEL } from "@/lib/constants/tickers";
import { Badge } from "@/components/ui/Badge";
import { buildHotNewsPath } from "@/lib/utils/slug";
import { useTrackEvent } from "@/lib/analytics/useTrackEvent";
import type { HotNewsPublicItem } from "@/types/hotNews";

/**
 * Hot in Korea card — same look as NewsCard, no thumbnail / view count / time
 * (PRD 4.9). Related-stock badges + title + short summary. `summary` is null for
 * non-premium viewers (DB-gated), so only the title/badges show — the card stays
 * clickable and gating happens on the detail page.
 */
export function HotNewsCard({ item }: { item: HotNewsPublicItem }) {
  const href = buildHotNewsPath(item.seqId, item.slug, item.title);
  const track = useTrackEvent();

  return (
    <Link
      href={href}
      onClick={() =>
        track("home_hot_in_korea_contents_clicked", { seq_id: item.seqId })
      }
      className="flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-5 text-left transition-colors hover:bg-surface-hover"
    >
      <div className="flex flex-wrap items-center gap-2">
        {item.tickers.map((ticker) => (
          <Badge key={ticker} tone="brand">
            {TICKER_LABEL[ticker]}
          </Badge>
        ))}
      </div>

      <h3 className="text-base font-semibold leading-snug text-foreground">
        {item.title}
      </h3>

      {item.summary && (
        <p className="line-clamp-3 text-sm leading-relaxed text-muted">
          {item.summary}
        </p>
      )}
    </Link>
  );
}
