import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getTranslations } from "@/lib/i18n/getTranslations";

export function SignupBanner() {
  const { t } = getTranslations();
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
          <Link href="/guide">
            <Button variant="primary" size="lg">
              {t("banner.cta")}
            </Button>
          </Link>
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
