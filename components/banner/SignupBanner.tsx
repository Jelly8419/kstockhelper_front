import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function SignupBanner() {
  return (
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
        <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
          <Link href="/guide">
            <Button variant="primary" size="lg">
              Start Trading
            </Button>
          </Link>
          <Link
            href="/settings"
            className="text-xs text-muted hover:text-foreground"
          >
            Already have an account? Connect your UID →
          </Link>
        </div>
      </div>
    </section>
  );
}
