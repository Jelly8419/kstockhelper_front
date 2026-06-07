import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { BYBIT_REFERRAL_URL } from "@/lib/constants/site";

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
          <a href={BYBIT_REFERRAL_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="primary" size="lg">
              Start Trading
            </Button>
          </a>
          <Link
            href="/settings"
            className="text-xs text-muted hover:text-foreground"
          >
            Already on Bybit? Connect your account →
          </Link>
        </div>
      </div>
    </section>
  );
}
