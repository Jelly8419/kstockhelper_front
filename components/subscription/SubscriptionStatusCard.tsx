"use client";

import { useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { errorKeyForCode } from "@/lib/i18n/errorCodes";
import { cancelSubscription } from "@/lib/subscription/subscription";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils/format";
import { SectionCard } from "@/components/settings/SectionCard";

/**
 * MyPage (settings) subscription card for restricted-region users. Shows the
 * Basic/Premium badge, billing/Premium-until date, a cancel button (only while
 * subscribed), and the payment-failed notice. Replaces the old waitlist card.
 *
 * Subscription state is display-only (useAuth reads it from `users`); Premium
 * gating stays driven by `tier`. Cancel is at-period-end (backend), then we
 * refresh auth to reflect the `canceling` state.
 */
export function SubscriptionStatusCard() {
  const { t } = useTranslation();
  const auth = useAuth();
  const { tier, subscriptionStatus, nextBillingAt, lastPaymentFailed } = auth;

  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPremium = tier === "premium";
  const billingDate = nextBillingAt ? formatDate(nextBillingAt) : null;
  // Cancel is available only for an actively-renewing subscription.
  const canCancel = subscriptionStatus === "active";

  const handleCancel = async () => {
    setError(null);
    setCanceling(true);
    try {
      const res = await cancelSubscription();
      if (res.success) {
        await auth.refresh();
        return;
      }
      const key = errorKeyForCode(res.code);
      setError((key ? t(key) : "") || res.message || t("subscription.error"));
    } finally {
      setCanceling(false);
    }
  };

  return (
    <SectionCard
      title={t("subscription.cardTitle")}
      badge={
        isPremium ? (
          <Badge tone="brand">{t("subscription.statusBadge.premium")}</Badge>
        ) : (
          <Badge tone="neutral">{t("subscription.statusBadge.basic")}</Badge>
        )
      }
    >
      {lastPaymentFailed && (
        <p className="text-sm text-down">{t("subscription.paymentFailed")}</p>
      )}

      {subscriptionStatus === "canceling" && billingDate ? (
        <p className="text-sm text-muted">
          {t("subscription.cancelPending", { date: billingDate })}
        </p>
      ) : subscriptionStatus === "active" ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-up">
            {t("subscription.active")}
          </p>
          {billingDate && (
            <p className="text-xs text-muted">
              {t("subscription.nextBilling", { date: billingDate })}
            </p>
          )}
        </div>
      ) : (
        // No active subscription (none / past_due): offer the subscribe path.
        <p className="text-sm text-muted">{t("subscription.subtitle")}</p>
      )}

      {error && <p className="text-sm text-down">{error}</p>}

      {canCancel ? (
        <Button
          variant="secondary"
          onClick={handleCancel}
          disabled={canceling}
          className="self-start"
        >
          {canceling
            ? t("subscription.canceling")
            : t("subscription.cancelButton")}
        </Button>
      ) : (
        !isPremium && (
          <Link href="/subscription">
            <Button className="self-start">
              {t("subscription.subscribeCta")}
            </Button>
          </Link>
        )
      )}
    </SectionCard>
  );
}
