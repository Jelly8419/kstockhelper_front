"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useTrackEvent } from "@/lib/analytics/useTrackEvent";
import { Button } from "@/components/ui/Button";

/** Poll cadence: re-check tier every 2s, up to ~15s, while the webhook lands. */
const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 8;

/**
 * PayPal return landing (`/subscription/success`). Activation is webhook-driven
 * on the backend, so Premium may not be on yet when the user returns here
 * (backend reply §1②: don't assume Premium immediately — poll until
 * tier='premium'). We refresh auth every 2s up to ~15s; once premium resolves we
 * show success, otherwise a "still confirming" notice with a manual refresh.
 */
export function SubscriptionSuccessClient() {
  const { tier, isLoading, refresh } = useAuth();
  const { t } = useTranslation();
  const track = useTrackEvent();
  const [exhausted, setExhausted] = useState(false);
  const pollsRef = useRef(0);
  // Guard so the activated / failed events each fire at most once per visit.
  const loggedRef = useRef(false);

  const isPremium = tier === "premium";

  useEffect(() => {
    if (isLoading || isPremium) return;

    const id = setInterval(() => {
      pollsRef.current += 1;
      if (pollsRef.current >= MAX_POLLS) {
        setExhausted(true);
        clearInterval(id);
        return;
      }
      void refresh();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(id);
  }, [isLoading, isPremium, refresh]);

  // Premium resolved → activation confirmed (approximation; the backend webhook
  // is the source of truth). Fire once.
  useEffect(() => {
    if (isPremium && !loggedRef.current) {
      loggedRef.current = true;
      track("subscription_activated", { source: "success_poll" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremium]);

  // Polling exhausted without Premium → activation not yet confirmed. Fire once.
  useEffect(() => {
    if (exhausted && !loggedRef.current) {
      loggedRef.current = true;
      track("subscription_activation_failed", { reason: "poll_timeout" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exhausted]);

  if (isLoading) {
    return <p className="text-sm text-muted">{t("common.loading")}</p>;
  }

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-foreground">
        {t("subscription.successTitle")}
      </h1>

      {isPremium ? (
        <>
          <p className="max-w-md text-sm text-up">{t("subscription.activated")}</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Link href="/price-gap">
              <Button>{t("subscription.goToMonitor")}</Button>
            </Link>
            <Link href="/settings">
              <Button variant="secondary">{t("subscription.goToSettings")}</Button>
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="max-w-md text-sm text-muted">
            {exhausted
              ? t("subscription.stillActivating")
              : t("subscription.activating")}
          </p>
          {exhausted && (
            <Button
              variant="secondary"
              onClick={() => {
                pollsRef.current = 0;
                setExhausted(false);
                void refresh();
              }}
            >
              {t("common.retry")}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
