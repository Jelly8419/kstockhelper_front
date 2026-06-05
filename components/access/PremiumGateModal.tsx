"use client";

import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Shown to free members: upgrade to premium (via IBKR broker connection). */
export function PremiumGateModal({ open, onClose }: Props) {
  const router = useRouter();
  return (
    <Modal open={open} onClose={onClose} title="Upgrade to Premium">
      <p className="text-sm text-muted">
        This content is available to premium members. Connect your IBKR broker
        account to unlock full access.
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={() => router.push("/guide")}>
          Get Started with IBKR
        </Button>
      </div>
    </Modal>
  );
}
