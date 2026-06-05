import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function SignupBanner() {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-brand/15 via-surface to-surface p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
            Buy Korean Stocks from Anywhere
          </h2>
          <p className="text-sm text-muted">
            Open access to Korean markets through your global broker.
          </p>
        </div>
        <Link href="/guide" className="shrink-0">
          <Button variant="primary" size="lg">
            Get Started with IBKR
          </Button>
        </Link>
      </div>
    </section>
  );
}
