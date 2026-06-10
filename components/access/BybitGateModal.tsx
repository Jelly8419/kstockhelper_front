"use client";

import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Shown to logged-in free members: connect Bybit to unlock premium. */
export function BybitGateModal({ open, onClose }: Props) {
  const router = useRouter();
  return (
    <Modal open={open} onClose={onClose} title="Unlock Premium Access">
      <p className="text-sm leading-relaxed text-muted">
        Connect your UID to get full access to all news &amp; disclosures.
      </p>
      <div className="mt-5 flex flex-col gap-2">
        <Button onClick={() => router.push("/settings")}>
          Connect Your UID
        </Button>
      </div>
    </Modal>
  );
}
