import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { getAppTranslations } from "@/lib/i18n/getTranslations";

/**
 * Home-screen entry point to the Price Gap Monitor (the page itself gates by
 * tier/region). Two-column hero: copy + CTA on the left, a sample Gap Tracker
 * chart image on the right. Stacks to a single column on mobile.
 */
export async function PriceGapHomeCard() {
  const { t } = await getAppTranslations();
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-brand/15 via-surface to-surface p-6 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        {/* Left: live badge, title, subtitle, CTA */}
        <div className="flex flex-col items-start gap-4 lg:max-w-sm lg:shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/15 px-3 py-1 text-sm font-medium text-danger">
            🔥 {t("home.priceGapCard.liveNow")}
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
              {t("home.priceGapCard.title")}
            </h2>
            <p className="text-sm text-muted sm:text-base">
              {t("home.priceGapCard.subtitle")}
            </p>
          </div>
          <Link href="/price-gap" className="mt-1">
            <Button variant="primary" size="lg">
              {t("home.priceGapCard.cta")} →
            </Button>
          </Link>
        </div>

        {/* Right: sample Gap Tracker chart */}
        <div className="w-full lg:max-w-2xl">
          <Image
            src="/price-gap-banner.png"
            alt={t("home.priceGapCard.title")}
            width={1280}
            height={703}
            className="h-auto w-full rounded-xl"
            priority
          />
        </div>
      </div>
    </section>
  );
}
