"use client";

import Link from "next/link";
import { NewsDetailItem } from "@/types/news";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { NewsDetail } from "./NewsDetail";
import { Button } from "@/components/ui/Button";

/**
 * Route-level access guard for news detail (covers direct URL access).
 * - premium → full detail
 * - free    → connect-UID panel
 * - guest   → sign-up panel
 *
 * Defense in depth: if the DB returned no body (gated), fall back to a gate
 * panel instead of an empty page.
 */
export function NewsDetailGate({ item }: { item: NewsDetailItem }) {
  const { tier, isLoading } = useAuth();
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

  // Free → connect UID to unlock premium.
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
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      <p className="max-w-sm text-sm text-muted">{description}</p>
      {children}
    </div>
  );
}
