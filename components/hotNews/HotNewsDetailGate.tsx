"use client";

import { TICKER_LABEL } from "@/lib/constants/tickers";
import { Badge } from "@/components/ui/Badge";
import { formatRegisteredTime } from "@/lib/utils/format";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LockedSummary } from "@/components/news/LockedSummary";
import { LockedContentCard } from "@/components/news/LockedContentCard";
import type { HotNewsDetailItem } from "@/types/hotNews";

/**
 * Route-level access guard for a Hot in Korea detail (PRD 4.10 / §10).
 *
 * The public header (title, related stocks, published time) is always rendered.
 * The body below is gated by tier, mirroring the news detail gate:
 *   - premium → full summary + key points
 *   - guest   → blurred summary tail + locked card (Sign Up / Log In)
 *   - free    → same, card says upgrade to Premium
 *
 * Non-premium callers get summary/keyPoints as null from the DB view, so we fall
 * to the locked view by tier (defense in depth even if a body slips through).
 */
export function HotNewsDetailGate({ item }: { item: HotNewsDetailItem }) {
  const { t } = useTranslation();
  const { tier, isLoading } = useAuth();

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {item.tickers.map((ticker) => (
            <Badge key={ticker} tone="brand">
              {TICKER_LABEL[ticker]}
            </Badge>
          ))}
          <span className="ml-auto text-xs text-muted">
            {formatRegisteredTime(item.publishedAt)}
          </span>
        </div>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          {item.title}
        </h1>
      </header>

      {isLoading ? (
        <p className="text-sm text-muted">{t("common.loading")}</p>
      ) : (
        <Body item={item} tier={tier} />
      )}
    </article>
  );
}

function Body({
  item,
  tier,
}: {
  item: HotNewsDetailItem;
  tier: ReturnType<typeof useAuth>["tier"];
}) {
  const { t } = useTranslation();
  const hasContent = item.summary != null || item.keyPoints != null;

  if (tier === "premium" && hasContent) {
    return (
      <div className="flex flex-col gap-6">
        {item.summary && (
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-muted">
              {t("news.summary")}
            </h2>
            <p className="text-base leading-relaxed text-foreground">
              {item.summary}
            </p>
          </section>
        )}

        {item.keyPoints && item.keyPoints.length > 0 && (
          <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-muted">
              {t("news.keyPoints")}
            </h2>
            <ul className="flex flex-col gap-2">
              {item.keyPoints.map((point, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm leading-relaxed text-foreground"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-semibold text-brand">
                    {i + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  // Non-premium: blurred summary tail + locked card (guest → create account,
  // free → upgrade to Premium).
  return (
    <>
      <LockedSummary preview={item.summary} />
      <LockedContentCard tier={tier === "guest" ? "guest" : "free"} />
    </>
  );
}
