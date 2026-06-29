import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { translate } from "@/lib/i18n/translate";
import { getAppTranslations } from "@/lib/i18n/getTranslations";
import { Link } from "@/lib/i18n/navigation";
import type { SupportedLocale } from "@/lib/i18n/config";
import { PageView } from "@/lib/analytics/PageView";
import { RequestForm } from "@/components/realEstate/RequestForm";
import { ContactChannels } from "@/components/realEstate/ContactChannels";
import { REAL_ESTATE_HOME_PATH } from "@/lib/constants/realEstate";

/**
 * Buying-support request page. Conversion (not SEO-landing) page, so it is
 * `noindex, follow` and excluded from the sitemap (SEO PRD §3). No canonical /
 * hreflang cluster — only the home page carries those.
 */
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const dict = getDictionary(locale as SupportedLocale);
  return {
    title: translate(dict, "realEstate.seo.requestTitle"),
    description: translate(dict, "realEstate.seo.requestDescription"),
    robots: { index: false, follow: true },
  };
}

export default async function RealEstateRequestPage() {
  const { t } = await getAppTranslations();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <PageView event="real_estate_request_page_viewed" />

      {/* Back link */}
      <Link
        href={REAL_ESTATE_HOME_PATH}
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← {t("realEstate.request.back")}
      </Link>

      {/* Header */}
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t("realEstate.request.header.title")}
        </h1>
        <p className="text-sm font-medium text-foreground">
          {t("realEstate.request.header.subtitle")}
        </p>
        <p className="text-sm text-muted">
          {t("realEstate.request.header.description")}
        </p>
      </header>

      {/* Form */}
      <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <RequestForm />
      </section>

      {/* Fast-response channels */}
      <section className="flex flex-col items-center gap-4 text-center">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-semibold text-foreground">
            {t("realEstate.request.channels.title")}
          </h2>
          <p className="text-sm text-muted">
            {t("realEstate.request.channels.description")}
          </p>
        </div>
        <ContactChannels />
      </section>

      {/* Safety notice */}
      <section className="flex flex-col gap-2 rounded-2xl border border-border bg-gradient-to-r from-brand/10 via-surface to-surface p-6 text-center">
        <h2 className="flex items-center justify-center gap-2 text-base font-semibold text-foreground">
          <span aria-hidden="true">🔒</span>
          {t("realEstate.request.safety.title")}
        </h2>
        <p className="text-sm text-muted">
          {t("realEstate.request.safety.description")}
        </p>
      </section>
    </div>
  );
}
