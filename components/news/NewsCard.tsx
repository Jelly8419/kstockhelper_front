import Link from "next/link";
import { NewsItem } from "@/types/news";
import { TICKER_LABEL } from "@/lib/mock/newsData";
import { Badge } from "@/components/ui/Badge";
import { formatRegisteredTime } from "@/lib/utils/format";
import { previewWords } from "@/lib/utils/truncate";

interface Props {
  item: NewsItem;
  /** When provided, intercepts the click instead of navigating (for gating). */
  onBlockedClick?: () => void;
}

export function NewsCard({ item, onBlockedClick }: Props) {
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
          {item.category === "disclosure" ? "Disclosure" : "News"}
        </Badge>
        <span className="ml-auto text-xs text-muted">
          {formatRegisteredTime(item.publishedAt)}
        </span>
      </div>

      <h3 className="text-base font-semibold leading-snug text-foreground">
        {item.title}
      </h3>

      <p className="text-sm leading-relaxed text-muted">
        {previewWords(item.body)}
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
