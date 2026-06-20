"use client";

import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { PriceGapMonitor } from "./PriceGapMonitor";

/**
 * Access guard for Price Gap Monitor.
 * Priority: guest > premium > free.
 *
 *  - guest:    no data; log in / sign up CTA.
 *  - premium:  realtime monitor (polls tier=premium).
 *  - free:     10-min delayed monitor (polls tier=basic), PIP locked.
 *
 * Region no longer gates access: restricted-country users may use the monitor
 * too. Their Premium path differs (PayPal subscription instead of UID) — that
 * branch lives inside the monitor's upgrade CTAs (DelayBadge / PipButton), which
 * route restricted users to `/subscription` instead of `/guide`.
 *
 * `premium`/`free` both render the monitor; the delay/PIP differences are
 * handled inside it by `tier`.
 */
export function PriceGapGate() {
  const { tier, isLoading } = useAuth();
  const { t } = useTranslation();

  if (isLoading) {
    return <p className="text-sm text-muted">{t("common.loading")}</p>;
  }

  if (tier === "guest") {
    return <GuestCta />;
  }

  return <PriceGapMonitor tier={tier} />;
}

/** Guests cannot view data; prompt login / signup (PRD §5.3). */
function GuestCta() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        {t("priceGap.title")}
      </h1>
      <p className="max-w-md text-sm text-muted">{t("priceGap.guest.cta")}</p>
      <div className="flex gap-2">
        <Link href="/login">
          <Button variant="secondary">{t("gnb.logIn")}</Button>
        </Link>
        <Link href="/signup">
          <Button>{t("gnb.signUp")}</Button>
        </Link>
      </div>
    </div>
  );
}
