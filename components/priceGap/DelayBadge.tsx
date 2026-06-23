"use client";

import { useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import type { UserTier } from "@/types/user";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useRestrictedRegion } from "@/lib/hooks/useRestrictedRegion";
import { useTrackEvent } from "@/lib/analytics/useTrackEvent";
import { SubscriptionRequiredModal } from "@/components/premium/SubscriptionRequiredModal";

/**
 * Delayed-data banner shown to non-premium tiers. The wording and CTA branch by
 * tier:
 *  - guest: "...as a guest" wording; CTA prompts login (→ /login), since a guest
 *           must first log in (then upgrade) to reach real-time data.
 *  - free:  "...Basic plan" wording; CTA is the upgrade path, branched by region:
 *           - allowed country:    link to the Start-Trading guide (/guide → UID).
 *           - restricted country: open the subscription-required modal
 *                                 (→ /subscription), as their Premium path is PayPal.
 */
export function DelayBadge({ tier }: { tier: UserTier }) {
  const { t } = useTranslation();
  const restricted = useRestrictedRegion();
  const track = useTrackEvent();
  const [modalOpen, setModalOpen] = useState(false);

  // Guest: prompt login (mirrors the news gate's login-required convention).
  if (tier === "guest") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm">
        <span className="text-foreground">{t("priceGap.guest.delayBanner")}</span>
        <Link
          href="/login"
          className="font-medium text-brand hover:underline"
          onClick={() =>
            track("login_required_modal_login_clicked", {
              trigger_page: "gap_monitor",
              auth_method: "email",
            })
          }
        >
          {t("priceGap.guest.loginCta")}
        </Link>
      </div>
    );
  }

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
