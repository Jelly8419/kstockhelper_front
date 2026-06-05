"use client";

import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Shown to guests (non-members): sign up to read. */
export function SignupGateModal({ open, onClose }: Props) {
  const router = useRouter();
  return (
    <Modal open={open} onClose={onClose} title="Sign up to read">
      <p className="text-sm text-muted">
        Create a free account to read full news and disclosures.
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={() => router.push("/signup")}>
          Sign Up
        </Button>
      </div>
    </Modal>
  );
}
