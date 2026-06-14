"use client";

import { Link } from "@/lib/i18n/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * Free-tier banner: "You are viewing 10-minute delayed data" + a link to the
 * Start-Trading guide (the project's path to realtime = connect an exchange).
 * The CTA wording is "View real-time data" (PRD §6) but it routes to `/guide`.
 */
export function DelayBadge() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm">
      <span className="text-foreground">{t("priceGap.delay.banner")}</span>
      <Link
        href="/guide"
        className="font-medium text-brand hover:underline"
      >
        {t("priceGap.delay.cta")}
      </Link>
    </div>
  );
}
