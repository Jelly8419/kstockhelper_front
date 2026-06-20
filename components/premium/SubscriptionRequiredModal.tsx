"use client";

import { useRouter } from "@/lib/i18n/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * Shown to restricted-region Basic users who click a Premium feature in the Gap
 * Monitor (the delay badge "View real-time data" or the locked PIP). Unlike the
 * old waitlist modal, it routes to the PayPal subscription page.
 *
 * "View Subscription" → `/subscription` (the restricted-region Premium path).
 * Close just dismisses. Allowed-country users never see this — their upgrade
 * path stays the existing UID/`/guide` flow.
 */
export function SubscriptionRequiredModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Modal open={open} onClose={onClose} title={t("subscription.modal.title")}>
      <p className="text-sm text-muted">{t("subscription.modal.body")}</p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>
          {t("common.close")}
        </Button>
        <Button onClick={() => router.push("/subscription")}>
          {t("subscription.modal.cta")}
        </Button>
      </div>
    </Modal>
  );
}
