"use client";

import { Link } from "@/lib/i18n/navigation";
import { ExchangeConnectForm } from "@/components/connect/ExchangeConnectForm";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { BYBIT_REFERRAL_URL, BINANCE_REFERRAL_URL } from "@/lib/constants/site";
import { getGuideContent } from "./guideContent";

export function GuideClient() {
  const { tier, refresh } = useAuth();
  const { locale, t } = useTranslation();
  const loggedIn = tier !== "guest";
  const c = getGuideContent(locale);

  return (
    <div className="mx-auto flex max-w-container flex-col gap-8 px-4 py-12 sm:px-6">
      {/* Header */}
      <header className="flex flex-col gap-3">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          {t("common.backToHome")}
        </Link>
        <h1 className="text-3xl font-bold text-foreground">{c.page.title}</h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted">
          {c.page.subtitle}
        </p>
      </header>

      {/* Step 1: create account */}
      <StepCard n={1} title={c.step1.title} subtitle={c.step1.description}>
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FeatureBlock
            title={c.step1.commonTrust.title}
            description={c.step1.commonTrust.description}
          />
          <FeatureBlock
            title={c.step1.commonDeposit.title}
            description={c.step1.commonDeposit.description}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SignupCard
            name="Binance"
            accent="binance"
            buttonLabel={c.step1.binanceButton}
            referral={BINANCE_REFERRAL_URL}
          />
          <SignupCard
            name="Bybit"
            accent="bybit"
            buttonLabel={c.step1.bybitButton}
            referral={BYBIT_REFERRAL_URL}
          />
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <Notice>{c.step1.notice.supportedRegions}</Notice>
          <Notice>{c.step1.notice.newAccountRequired}</Notice>
        </div>
      </StepCard>

      {/* Step 2: connect UID */}
      <StepCard n={2} title={c.step2.title} subtitle={c.step2.description}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ConnectCard
            name="Binance"
            accent="binance"
            steps={[c.step2.binanceHelp1, c.step2.binanceHelp2]}
          >
            <ExchangeConnectForm
              exchange="binance"
              accent="binance"
              loggedIn={loggedIn}
              onSuccess={refresh}
            />
          </ConnectCard>
          <ConnectCard
            name="Bybit"
            accent="bybit"
            steps={[c.step2.bybitHelp1, c.step2.bybitHelp2]}
          >
            <ExchangeConnectForm
              exchange="bybit"
              accent="bybit"
              loggedIn={loggedIn}
              onSuccess={refresh}
            />
          </ConnectCard>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <Notice>{c.step2.notice.sameDayApproval}</Notice>
          <Notice>{c.step2.notice.premium30Days}</Notice>
          <Notice>{c.step2.notice.monthlyTradingRequired}</Notice>
          <Notice>{c.step2.notice.returnToBasic}</Notice>
        </div>
      </StepCard>

      {/* Step 3: premium benefits */}
      <StepCard n={3} title={c.step3.title}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <BenefitCard
            title={c.step3.benefitNews.title}
            description={c.step3.benefitNews.description}
          />
          <BenefitCard
            title={c.step3.benefitMarketData.title}
            description={c.step3.benefitMarketData.description}
          />
          <BenefitCard
            title={c.step3.benefitComingSoon.title}
            description={c.step3.benefitComingSoon.description}
          />
        </div>
      </StepCard>

      {/* Bottom notice */}
      <p className="rounded-lg border border-border bg-surface/50 px-4 py-3 text-center text-xs leading-relaxed text-muted">
        ⓘ {c.bottom.notice.uidRequired}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function StepCard({
  n,
  title,
  subtitle,
  children,
}: {
  n: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface/50 p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
          {n}
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      <div className="sm:pl-10">{children}</div>
    </section>
  );
}

function FeatureBlock({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-border bg-surface p-4">
      <span className="text-up">✓</span>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span className="text-xs text-muted">{description}</span>
      </div>
    </div>
  );
}

function SignupCard({
  name,
  accent,
  buttonLabel,
  referral,
}: {
  name: string;
  accent: "binance" | "bybit";
  buttonLabel: string;
  referral: string;
}) {
  const btn =
    accent === "binance"
      ? "bg-[#f0b90b] text-black hover:bg-[#d9a800]"
      : "bg-[#2e7cf6] text-white hover:bg-[#1f6ae0]";
  const nameColor = accent === "binance" ? "text-[#f0b90b]" : "text-foreground";
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
      <span className={`text-lg font-bold ${nameColor}`}>{name}</span>
      <a
        href={referral}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto"
      >
        <button
          className={`flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors ${btn}`}
        >
          {buttonLabel} ↗
        </button>
      </a>
    </div>
  );
}

function ConnectCard({
  name,
  accent,
  steps,
  children,
}: {
  name: string;
  accent: "binance" | "bybit";
  steps: string[];
  children: React.ReactNode;
}) {
  const nameColor = accent === "binance" ? "text-[#f0b90b]" : "text-foreground";
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-6">
      <span className={`text-base font-bold ${nameColor}`}>{name}</span>
      {children}
      <div className="rounded-lg border border-border bg-background p-3">
        <ul className="flex flex-col gap-1 text-xs text-muted">
          {steps.map((s) => (
            <li key={s}>• {s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function BenefitCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5">
      <p className="flex items-start gap-2 text-sm font-semibold text-foreground">
        <span className="text-up">👑</span>
        <span>{title}</span>
      </p>
      <p className="text-xs leading-relaxed text-muted">{description}</p>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-border bg-background px-4 py-3 text-xs leading-relaxed text-muted">
      ⓘ {children}
    </p>
  );
}
