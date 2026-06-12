"use client";

import { useRouter } from "@/lib/i18n/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Shown to logged-in free members: connect Bybit to unlock premium. */
export function BybitGateModal({ open, onClose }: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <Modal open={open} onClose={onClose} title={t("newsGate.premiumTitle")}>
      <p className="text-sm leading-relaxed text-muted">
        {t("newsGate.premiumBody")}
      </p>
      <div className="mt-5 flex flex-col gap-2">
        <Button onClick={() => router.push("/settings")}>
          {t("newsGate.premiumCta")}
        </Button>
      </div>
    </Modal>
  );
}
