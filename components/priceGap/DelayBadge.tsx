"use client";

import { useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useRestrictedRegion } from "@/lib/hooks/useRestrictedRegion";
import { SubscriptionRequiredModal } from "@/components/premium/SubscriptionRequiredModal";

/**
 * Free-tier banner: "You are viewing 10-minute delayed data" + a "View
 * real-time data" CTA. The upgrade path branches by region:
 *  - allowed country:    link to the Start-Trading guide (/guide → connect UID).
 *  - restricted country: open the subscription-required modal (→ /subscription),
 *                        since their Premium path is PayPal, not UID.
 */
export function DelayBadge() {
  const { t } = useTranslation();
  const restricted = useRestrictedRegion();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm">
      <span className="text-foreground">{t("priceGap.delay.banner")}</span>
      {restricted ? (
        <>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="font-medium text-brand hover:underline"
          >
            {t("priceGap.delay.cta")}
          </button>
          <SubscriptionRequiredModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            triggerPage="gap_monitor"
            triggerFeature="realtime_data"
          />
        </>
      ) : (
        <Link
          href="/guide"
          className="font-medium text-brand hover:underline"
        >
          {t("priceGap.delay.cta")}
        </Link>
      )}
    </div>
  );
}
