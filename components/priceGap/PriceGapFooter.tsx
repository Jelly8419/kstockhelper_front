"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * Description / Notes below the chart (PRD §10): About Gap (the USDT-based
 * formula), Past Avg Gap, Gap vs Past Avg, and Notes. Free tier adds the
 * 10-minute-delay lines.
 */
export function PriceGapFooter({ tier }: { tier: "free" | "premium" }) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-6 border-t border-border pt-4 text-xs text-muted sm:grid-cols-2">
      <div>
        <p className="mb-1 font-medium text-foreground">
          {t("priceGap.footer.aboutTitle")}
        </p>
        <p>{t("priceGap.footer.formulaRef")}</p>
        <p>{t("priceGap.footer.formulaGap")}</p>
        <p>{t("priceGap.footer.formulaGapPct")}</p>
        <p className="mt-1">{t("priceGap.footer.causes")}</p>
      </div>

      <div>
        <p className="mb-1 font-medium text-foreground">
          {t("priceGap.footer.avgTitle")}
        </p>
        <p>{t("priceGap.footer.pastAvgGap")}</p>
        <p className="mt-1">{t("priceGap.footer.gapVsPastAvg")}</p>
        <p className="mt-1 text-[11px]">
          {t("priceGap.footer.availableData")}
        </p>
      </div>

      <div className="sm:col-span-2">
        <p className="mb-1 font-medium text-foreground">
          {t("priceGap.footer.notesTitle")}
        </p>
        <ul className="list-disc space-y-1 pl-4">
          {tier === "free" && <li>{t("priceGap.footer.noteDelay")}</li>}
          {tier === "free" && <li>{t("priceGap.footer.noteRefresh")}</li>}
          <li>{t("priceGap.footer.noteLocalTime")}</li>
          <li>{t("priceGap.footer.noteAdvice")}</li>
        </ul>
      </div>
    </div>
  );
}
