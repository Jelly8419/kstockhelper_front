"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface Props {
  open: boolean;
  onClose: () => void;
}

/** One-per-day notice shown right after login. */
export function AccessNoticeModal({ open, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Access Notice">
      <p className="text-sm leading-relaxed text-muted">
        You currently have access to all content. Soon, only approved members
        will be able to access K-Stock Helper content.
      </p>
      <div className="mt-5 flex justify-end">
        <Button size="sm" onClick={onClose}>
          OK
        </Button>
      </div>
    </Modal>
  );
}
