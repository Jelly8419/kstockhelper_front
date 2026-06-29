import { Button } from "@/components/ui/Button";
import { getAppTranslations } from "@/lib/i18n/getTranslations";
import { TrackedLink } from "@/lib/analytics/TrackedLink";
import { PageView } from "@/lib/analytics/PageView";
import { ContactChannels } from "./ContactChannels";
import { REAL_ESTATE_REQUEST_PATH } from "@/lib/constants/realEstate";

/**
 * Real Estate buying-support landing page body (PRD "부동산 구매 요청 홈 PRD" §5,§8).
 * Server component — static marketing content; the only client islands are
 * PageView (mount event), TrackedLink (CTA tracking), and ContactChannels.
 *
 * Section order: hero → trust cards → support scope → why-choose-us → value
 * cards → direct-contact → privacy note. The page-level nav/footer come from the
 * shared locale layout; the hero CTA routes to the request form.
 */
export async function RealEstateHome() {
  const { t } = await getAppTranslations();

  const trustCards = [
    { title: t("realEstate.home.trust.card1Title"), desc: t("realEstate.home.trust.card1Desc") },
    { title: t("realEstate.home.trust.card2Title"), desc: t("realEstate.home.trust.card2Desc") },
    { title: t("realEstate.home.trust.card3Title"), desc: t("realEstate.home.trust.card3Desc") },
    { title: t("realEstate.home.trust.card4Title"), desc: t("realEstate.home.trust.card4Desc") },
  ];

  const steps = [
    t("realEstate.home.scope.step1"),
    t("realEstate.home.scope.step2"),
    t("realEstate.home.scope.step3"),
    t("realEstate.home.scope.step4"),
    t("realEstate.home.scope.step5"),
  ];

  const whyPoints = [
    t("realEstate.home.why.point1"),
    t("realEstate.home.why.point2"),
    t("realEstate.home.why.point3"),
    t("realEstate.home.why.point4"),
  ];

  const valueCards = [
    { title: t("realEstate.home.values.card1Title"), desc: t("realEstate.home.values.card1Desc") },
    { title: t("realEstate.home.values.card2Title"), desc: t("realEstate.home.values.card2Desc") },
    { title: t("realEstate.home.values.card3Title"), desc: t("realEstate.home.values.card3Desc") },
  ];

  return (
    <div className="mx-auto flex max-w-container flex-col gap-16 px-4 py-10 sm:px-6 sm:py-14">
      <PageView event="real_estate_home_viewed" />

      {/* Hero */}
      <section className="flex flex-col items-center gap-6 text-center">
        <span className="inline-flex items-center rounded-full bg-brand/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand">
          {t("realEstate.home.hero.badge")}
        </span>
        <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-5xl">
          {t("realEstate.home.hero.titleLine1")}
          <br />
          <span className="text-brand">{t("realEstate.home.hero.titleLine2")}</span>
        </h1>
        <p className="text-lg font-semibold text-foreground sm:text-xl">
          {t("realEstate.home.hero.highlight")}
        </p>
        <p className="max-w-2xl text-sm text-muted sm:text-base">
          {t("realEstate.home.hero.description")}
        </p>
        <div className="flex flex-col items-center gap-2">
          <TrackedLink event="real_estate_request_page_viewed" href={REAL_ESTATE_REQUEST_PATH}>
            <Button variant="primary" size="lg">
              {t("realEstate.home.hero.cta")} →
            </Button>
          </TrackedLink>
          <p className="text-xs text-muted">{t("realEstate.home.hero.ctaSub")}</p>
        </div>
      </section>

      {/* Trust cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {trustCards.map((card) => (
          <div
            key={card.title}
            className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5"
          >
            <h3 className="text-base font-semibold text-foreground">{card.title}</h3>
            <p className="text-sm text-muted">{card.desc}</p>
          </div>
        ))}
      </section>

      {/* Support scope */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            {t("realEstate.home.scope.title")}
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-muted">
            {t("realEstate.home.scope.description")}
          </p>
        </div>
        <ol className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-2">
          {steps.map((step, i) => (
            <li
              key={step}
              className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-surface p-4 lg:flex-col lg:text-center"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/15 text-sm font-semibold text-brand">
                {i + 1}
              </span>
              <span className="text-sm font-medium text-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Why foreign buyers choose us */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-gradient-to-r from-brand/10 via-surface to-surface p-6 sm:p-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            {t("realEstate.home.why.title")}
          </h2>
          <p className="text-sm font-medium text-brand sm:text-base">
            {t("realEstate.home.why.subtitle")}
          </p>
        </div>
        <ul className="flex flex-col gap-3">
          {whyPoints.map((point) => (
            <li key={point} className="flex items-start gap-2.5 text-sm text-foreground">
              <span className="mt-0.5 text-brand" aria-hidden="true">
                {"✓"}
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Value cards */}
      <section className="flex flex-col gap-4">
        {valueCards.map((card) => (
          <div
            key={card.title}
            className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-6"
          >
            <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
            <p className="text-sm text-muted">{card.desc}</p>
          </div>
        ))}
      </section>

      {/* Direct contact */}
      <section className="flex flex-col items-center gap-5 text-center">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            {t("realEstate.home.contact.title")}
          </h2>
          <p className="mx-auto max-w-xl text-sm text-muted">
            {t("realEstate.home.contact.description")}
          </p>
        </div>
        <ContactChannels />
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <span aria-hidden="true">🔒</span>
          {t("realEstate.home.contact.privacyNote")}
        </p>
      </section>
    </div>
  );
}
