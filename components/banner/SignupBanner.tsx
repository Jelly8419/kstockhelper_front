"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function SignupBanner() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-brand/15 via-surface to-surface p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
              Trade Korea&apos;s Stock Market
            </h2>
            <p className="text-sm text-muted">
              Open access to Korean markets through your global broker.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="shrink-0"
            onClick={() => setOpen(true)}
          >
            Start Trading
          </Button>
        </div>
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title="Start Trading">
        <p className="text-sm leading-relaxed text-muted">
          Coming soon in June 2026.
        </p>
        <div className="mt-5 flex justify-end">
          <Button size="sm" onClick={() => setOpen(false)}>
            OK
          </Button>
        </div>
      </Modal>
    </>
  );
}
