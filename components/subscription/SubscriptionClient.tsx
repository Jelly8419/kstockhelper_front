"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/lib/i18n/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRestrictedRegion } from "@/lib/hooks/useRestrictedRegion";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { errorKeyForCode } from "@/lib/i18n/errorCodes";
import { createSubscription } from "@/lib/subscription/subscription";
import { useTrackEvent } from "@/lib/analytics/useTrackEvent";
import { Button } from "@/components/ui/Button";

/**
 * `/subscription` page body (restricted-region PayPal Premium path).
 *
 * Access (defence-in-depth; middleware already redirects allowed regions home):
 *  - guest         → redirect to /login
 *  - non-restricted → "This page is not available." (client fallback)
 *  - restricted premium → page shown, subscribe button DISABLED
 *  - restricted basic   → full page, "Continue with PayPal" active
 *
 * The CTA calls the create proxy and redirects the browser to PayPal's approval
 * URL. Activation is webhook-driven on the backend — nothing here grants Premium.
 */
export function SubscriptionClient() {
  const router = useRouter();
  const { tier, isLoading } = useAuth();
  const restricted = useRestrictedRegion();
  const { t } = useTranslation();
  const track = useTrackEvent();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Route guard: redirect guests to login once auth has resolved.
  useEffect(() => {
    if (!isLoading && tier === "guest") {
      router.replace("/login");
    }
  }, [isLoading, tier, router]);

  // Log the page view once the (restricted, non-guest) page is actually shown.
  const pageVisible = !isLoading && tier !== "guest" && restricted;
  useEffect(() => {
    if (pageVisible) track("subscription_page_viewed");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageVisible]);

  if (isLoading || tier === "guest") {
    return <p className="text-sm text-muted">{t("common.loading")}</p>;
  }

  // Allowed-country fallback (middleware also redirects these home).
  if (!restricted) {
    return (
      <p className="py-16 text-center text-sm text-muted">
        {t("subscription.unavailable")}
      </p>
    );
  }

  const isPremium = tier === "premium";

  const handleSubscribe = async () => {
    track("subscribe_button_clicked", { plan: "regular" });
    setError(null);
    setSubmitting(true);
    try {
      const res = await createSubscription();
      if (res.success && res.approvalUrl) {
        // Hand off to PayPal. Activation is confirmed by the backend webhook.
        window.location.href = res.approvalUrl;
        return;
      }
      const key = errorKeyForCode(res.code);
      setError((key ? t(key) : "") || res.message || t("subscription.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          {t("subscription.title")}
        </h1>
        <p className="text-sm text-muted">{t("subscription.subtitle")}</p>
      </header>

      {/* Benefits / price card */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
        <div>
          <p className="text-lg font-semibold text-foreground">
            {t("subscription.priceLine")}
          </p>
          <p className="text-sm text-muted">{t("subscription.cancelAnytime")}</p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-foreground">
            {t("subscription.benefitsTitle")}
          </p>
          <ul className="flex flex-col gap-1 text-sm text-muted">
            <li>• {t("subscription.benefit1")}</li>
            <li>• {t("subscription.benefit2")}</li>
            <li>• {t("subscription.benefit3")}</li>
          </ul>
        </div>

        {error && <p className="text-sm text-down">{error}</p>}

        {isPremium ? (
          <>
            <Button disabled className="self-start">
              {t("subscription.subscribeCta")}
            </Button>
            <p className="text-xs text-muted">
              {t("subscription.alreadyPremium")}
            </p>
          </>
        ) : (
          <Button
            onClick={handleSubscribe}
            disabled={submitting}
            className="self-start"
          >
            {submitting ? t("subscription.processing") : t("subscription.cta")}
          </Button>
        )}
      </section>

      <p className="text-xs text-muted">{t("subscription.refundPolicy")}</p>
    </div>
  );
}
