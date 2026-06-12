"use client";

import { NewsDetailItem } from "@/types/news";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { NewsDetail } from "./NewsDetail";
import { NewsPublicHeader } from "./NewsPublicHeader";
import { LockedSummary } from "./LockedSummary";
import { LockedContentCard } from "./LockedContentCard";

/**
 * Route-level access guard for news/disclosure detail (covers direct URL access).
 *
 * The public header (title, related stocks, type, published time, source) is
 * ALWAYS rendered — guests and crawlers must read it (SEO). The body below is
 * gated per tier:
 * - premium → full detail (full summary, key points, key figures)
 * - guest   → public preview + blurred summary tail + locked key-points card
 *             (create an account: Sign Up / Log In)
 * - free    → same, but the card says upgrade to Premium
 *
 * Defense in depth: if the DB returned no body (gated server-side), a premium
 * user still falls through to the locked view instead of an empty body.
 */
export function NewsDetailGate({ item }: { item: NewsDetailItem }) {
  const { tier, isLoading } = useAuth();

  return (
    <article className="flex flex-col gap-6">
      <NewsPublicHeader item={item} />
      <LockedBody item={item} tier={tier} isLoading={isLoading} />
    </article>
  );
}

function LockedBody({
  item,
  tier,
  isLoading,
}: {
  item: NewsDetailItem;
  tier: ReturnType<typeof useAuth>["tier"];
  isLoading: boolean;
}) {
  const { t } = useTranslation();

  if (isLoading) {
    return <p className="text-sm text-muted">{t("common.loading")}</p>;
  }

  const hasContent = item.summary != null || item.body != null;
  if (tier === "premium" && hasContent) {
    return <NewsDetail item={item} />;
  }

  // Non-premium: public preview + blurred summary tail, then the locked
  // key-points card. Guest → create an account; free (or premium with a gated
  // empty body) → upgrade to Premium.
  return (
    <>
      <LockedSummary preview={item.preview} />
      <LockedContentCard tier={tier === "guest" ? "guest" : "free"} />
    </>
  );
}
