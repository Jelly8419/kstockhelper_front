import { Button } from "@/components/ui/Button";
import { getAppTranslations } from "@/lib/i18n/getTranslations";
import { TrackedLink } from "@/lib/analytics/TrackedLink";
import { REAL_ESTATE_HOME_PATH } from "@/lib/constants/realEstate";

/**
 * Home-screen entry point to the Real Estate buying-support service (PRD §2).
 * NEW badge + title + subtitle + CTA, linking to the Real Estate home. Mirrors
 * the SignupBanner / PriceGapHomeCard layout (rounded gradient section, CTA on
 * the right on desktop, stacked on mobile). Doubles as the mobile entry point
 * since the GNB link is desktop-only.
 */
export async function RealEstateBanner() {
  const { t } = await getAppTranslations();
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-brand/15 via-surface to-surface p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
            {t("home.realEstateBanner.badge")}
          </span>
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
            {t("home.realEstateBanner.title")}
          </h2>
          <p className="max-w-2xl text-sm text-muted">
            {t("home.realEstateBanner.subtitle")}
          </p>
        </div>
        <div className="shrink-0">
          <TrackedLink
            event="home_real_estate_banner_clicked"
            href={REAL_ESTATE_HOME_PATH}
          >
            <Button variant="primary" size="lg">
              {t("home.realEstateBanner.cta")} →
            </Button>
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}
