"use client";

import { Link } from "@/lib/i18n/navigation";
import { NewsDetailItem } from "@/types/news";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { NewsDetail } from "./NewsDetail";
import { NewsPublicHeader } from "./NewsPublicHeader";
import { Button } from "@/components/ui/Button";

/**
 * Route-level access guard for news/disclosure detail (covers direct URL access).
 *
 * The public header (title, related stocks, published time, source, short
 * summary) is ALWAYS rendered — guests and crawlers must be able to read it
 * (SEO PRD §6, §13). Only the locked body below it is gated:
 * - premium → full detail (summary, key points, key figures)
 * - free    → connect-UID panel
 * - guest   → sign-up panel
 *
 * Defense in depth: if the DB returned no body (gated server-side), premium
 * users still fall through to the unlock panel instead of an empty body.
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

  // Guest → sign up first.
  if (tier === "guest") {
    return (
      <Panel
        title={t("newsGate.signupTitle")}
        description={t("newsGate.signupBody")}
      >
        <Link href="/signup">
          <Button>{t("newsGate.signupCta")}</Button>
        </Link>
      </Panel>
    );
  }

  // Free (or premium with gated/empty body) → connect UID to unlock premium.
  return (
    <Panel
      title={t("newsGate.premiumTitle")}
      description={t("newsGate.premiumBody")}
    >
      <Link href="/settings">
        <Button>{t("newsGate.premiumCta")}</Button>
      </Link>
    </Panel>
  );
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface px-6 py-16 text-center">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="max-w-sm text-sm text-muted">{description}</p>
      {children}
    </div>
  );
}
