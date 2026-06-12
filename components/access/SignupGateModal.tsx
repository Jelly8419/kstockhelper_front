"use client";

import { useRouter } from "@/lib/i18n/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Shown to guests (non-members): sign up to read. */
export function SignupGateModal({ open, onClose }: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <Modal open={open} onClose={onClose} title={t("newsGate.signupTitle")}>
      <p className="text-sm text-muted">{t("newsGate.signupBody")}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>
          {t("common.cancel")}
        </Button>
        <Button size="sm" onClick={() => router.push("/signup")}>
          {t("newsGate.signupCta")}
        </Button>
      </div>
    </Modal>
  );
}
