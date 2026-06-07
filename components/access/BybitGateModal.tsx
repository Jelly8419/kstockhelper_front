"use client";

import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { BYBIT_REFERRAL_URL } from "@/lib/constants/site";

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
        Connect your Bybit account to get full access to all news &amp;
        disclosures.
      </p>
      <div className="mt-5 flex flex-col gap-2">
        <Button onClick={() => router.push("/settings")}>
          Connect Bybit Account
        </Button>
        <a
          href={BYBIT_REFERRAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-sm text-brand hover:underline"
        >
          Learn more
        </a>
      </div>
    </Modal>
  );
}
