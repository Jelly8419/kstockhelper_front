import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { getAppTranslations } from "@/lib/i18n/getTranslations";
import { TrackedLink } from "@/lib/analytics/TrackedLink";

export async function SignupBanner() {
  const { t } = await getAppTranslations();
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-brand/15 via-surface to-surface p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
            {t("banner.title")}
          </h2>
          <p className="text-sm text-muted">{t("banner.subtitle")}</p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
          <TrackedLink
            event="home_start_trading_banner_clicked"
            href="/guide"
          >
            <Button variant="primary" size="lg">
              {t("banner.cta")}
            </Button>
          </TrackedLink>
          <Link
            href="/settings"
            className="text-xs text-muted hover:text-foreground"
          >
            {t("banner.connectPrompt")}
          </Link>
        </div>
      </div>
    </section>
  );
}
