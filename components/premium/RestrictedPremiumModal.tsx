"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { joinWaitlist, type WaitlistStatus } from "@/lib/premium/waitlist";

/**
 * Shown to restricted-region users who try to enter the Premium upgrade flow
 * (PRD §3–4). Explains that exchange-linked Premium is unavailable in their
 * region. `Confirm` just closes (page unchanged); `Join Waitlist` registers the
 * logged-in user and is hidden for guests (PRD §5).
 */
export function RestrictedPremiumModal({
  open,
  onClose,
  isLoggedIn,
}: {
  open: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
}) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<WaitlistStatus | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleJoin = async () => {
    setSubmitting(true);
    try {
      setStatus(await joinWaitlist());
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset transient state so the next open starts clean.
    setStatus(null);
    setSubmitting(false);
    onClose();
  };

  const message =
    status === "ok"
      ? t("restrictedPremium.waitlistSuccess")
      : status === "already"
        ? t("restrictedPremium.waitlistAlready")
        : status === "error"
          ? t("restrictedPremium.waitlistError")
          : null;

  // Once joined (or already on it), the Join button is no longer actionable.
  const joined = status === "ok" || status === "already";

  return (
    <Modal open={open} onClose={handleClose} title={t("restrictedPremium.title")}>
      <p className="text-sm text-muted">{t("restrictedPremium.body")}</p>

      {message && (
        <p
          className={`mt-3 text-sm ${
            status === "error" ? "text-down" : "text-up"
          }`}
        >
          {message}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={handleClose}>
          {t("restrictedPremium.confirm")}
        </Button>
        {isLoggedIn && (
          <Button onClick={handleJoin} disabled={submitting || joined}>
            {submitting ? t("common.loading") : t("restrictedPremium.joinWaitlist")}
          </Button>
        )}
      </div>
    </Modal>
  );
}
