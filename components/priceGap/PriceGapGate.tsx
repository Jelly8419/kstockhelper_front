"use client";

import { useState } from "react";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRestrictedRegion } from "@/lib/hooks/useRestrictedRegion";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { RestrictedPremiumModal } from "@/components/premium/RestrictedPremiumModal";
import { PriceGapMonitor } from "./PriceGapMonitor";

/**
 * Access guard for Price Gap Monitor (frontend-prd §1).
 * Priority: restricted > guest > premium > free.
 *
 *  - restricted: no data; same policy as the trade banner/guide
 *                (`isRestrictedRegion`, KR included). Shows the existing
 *                RestrictedPremiumModal (Waitlist).
 *  - guest:      no data; log in / sign up CTA.
 *  - premium:    realtime monitor (polls tier=premium).
 *  - free:       10-min delayed monitor (polls tier=basic), PIP locked.
 *
 * `premium`/`free` both render the monitor; the delay/PIP differences are
 * handled inside it by `tier`.
 */
export function PriceGapGate() {
  const { tier, isLoading } = useAuth();
  const restricted = useRestrictedRegion();
  const { t } = useTranslation();

  if (isLoading) {
    return <p className="text-sm text-muted">{t("common.loading")}</p>;
  }

  if (restricted) {
    return <RestrictedNotice isLoggedIn={tier !== "guest"} />;
  }

  if (tier === "guest") {
    return <GuestCta />;
  }

  return <PriceGapMonitor tier={tier} />;
}

/**
 * Restricted-region users get no data — only the standard Waitlist modal,
 * opened immediately on entry (Confirm just closes; nothing behind it).
 */
function RestrictedNotice({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        {t("priceGap.title")}
      </h1>
      <p className="max-w-md text-sm text-muted">
        {t("priceGap.restricted.body")}
      </p>
      <Button onClick={() => setOpen(true)}>
        {t("restrictedPremium.title")}
      </Button>
      <RestrictedPremiumModal
        open={open}
        onClose={() => setOpen(false)}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
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
