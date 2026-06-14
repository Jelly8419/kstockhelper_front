import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { getAppTranslations } from "@/lib/i18n/getTranslations";

/**
 * Home-screen entry point to the Price Gap Monitor (the page itself gates by
 * tier/region). Mirrors the SignupBanner card style.
 */
export async function PriceGapHomeCard() {
  const { t } = await getAppTranslations();
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-brand/15 via-surface to-surface p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
            {t("home.priceGapCard.title")}
          </h2>
          <p className="text-sm text-muted">
            {t("home.priceGapCard.subtitle")}
          </p>
        </div>
        <Link href="/price-gap" className="shrink-0">
          <Button variant="primary" size="lg">
            {t("home.priceGapCard.cta")}
          </Button>
        </Link>
      </div>
    </section>
  );
}
