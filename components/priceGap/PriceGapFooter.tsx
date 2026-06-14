"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * Bottom notes (mockup): About Price Gap (the USDT-based formula), tier-specific
 * Notes (free mentions the 10-min delay), and the market-hours notice.
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
        <p className="mt-1">{t("priceGap.footer.causes")}</p>
      </div>

      <div>
        <p className="mb-1 font-medium text-foreground">
          {t("priceGap.footer.notesTitle")}
        </p>
        <ul className="list-disc space-y-1 pl-4">
          {tier === "free" && <li>{t("priceGap.footer.noteDelay")}</li>}
          {tier === "free" && <li>{t("priceGap.footer.noteRefresh")}</li>}
          <li>{t("priceGap.footer.noteAdvice")}</li>
          <li>{t("priceGap.footer.noteKst")}</li>
        </ul>
      </div>
    </div>
  );
}
