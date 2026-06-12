"use client";

import { Link } from "@/lib/i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { ExchangeConnectForm } from "@/components/connect/ExchangeConnectForm";
import { useAuth } from "@/lib/hooks/useAuth";
import { BYBIT_REFERRAL_URL, BINANCE_REFERRAL_URL } from "@/lib/constants/site";

export function GuideClient() {
  const { tier, refresh } = useAuth();
  const loggedIn = tier !== "guest";

  return (
    <div className="mx-auto flex max-w-container flex-col gap-8 px-4 py-12 sm:px-6">
      {/* Header */}
      <header className="flex flex-col gap-3">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-foreground">
          Start Trading – Guide
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted">
          Follow the steps below to create an account on your preferred exchange,
          connect your UID, and get premium access.
        </p>
      </header>

      {/* Step 1: create account */}
      <StepCard
        n={1}
        title="Create an Account on Your Preferred Exchange"
        subtitle="Choose an exchange and sign up using our referral link."
      >
        <p className="mb-4 inline-flex items-center gap-2 rounded-lg bg-brand/10 px-3 py-1.5 text-xs text-brand">
          ⓘ You&apos;ll receive trading fee discounts.
        </p>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ExchangeIntro
            name="Binance"
            accent="binance"
            popular
            features={[
              "Access Korean stock-linked products",
              "High liquidity and low trading fees",
              "Trusted by millions of users worldwide",
              "Manual approval within 24 hours ⓘ",
            ]}
            referral={BINANCE_REFERRAL_URL}
          />
          <ExchangeIntro
            name="Bybit"
            accent="bybit"
            features={[
              "Korean stock-linked trading available",
              "Advanced trading tools & interface",
              "Fast account opening process",
              "Instant auto-approval ⚡",
            ]}
            referral={BYBIT_REFERRAL_URL}
          />
        </div>
        <p className="mt-4 rounded-lg border border-border bg-background px-4 py-3 text-xs text-muted">
          ⓘ Only eligible users in supported regions can sign up through our
          links.
        </p>
      </StepCard>

      {/* Step 2: connect UID */}
      <StepCard
        n={2}
        title="Connect Your UID & Apply for Premium"
        subtitle="Enter your UID from the exchange and submit your application."
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ExchangeConnect
            name="Binance"
            accent="binance"
            steps={["Go to Binance App → Profile → ID", "Copy the UID (numbers only)"]}
          >
            <ExchangeConnectForm
              exchange="binance"
              accent="binance"
              loggedIn={loggedIn}
              onSuccess={refresh}
            />
          </ExchangeConnect>
          <ExchangeConnect
            name="Bybit"
            accent="bybit"
            steps={["Go to Bybit App → Profile → UID", "Copy the UID (numbers only)"]}
          >
            <ExchangeConnectForm
              exchange="bybit"
              accent="bybit"
              loggedIn={loggedIn}
              onSuccess={refresh}
            />
          </ExchangeConnect>
        </div>
        <p className="mt-4 rounded-lg border border-border bg-background px-4 py-3 text-xs text-muted">
          🛡️ Bybit is approved instantly after verification. Binance is reviewed
          by our team within 24 hours.
        </p>
      </StepCard>

      {/* Step 3: approval + benefits */}
      <StepCard
        n={3}
        title="Get Approved & Go Premium"
        subtitle="Once your UID is verified, your Premium access is activated."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <Flow />
          <PremiumBenefits />
        </div>
      </StepCard>
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
  subtitle: string;
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
          <p className="text-sm text-muted">{subtitle}</p>
        </div>
      </div>
      <div className="sm:pl-10">{children}</div>
    </section>
  );
}

function ExchangeIntro({
  name,
  accent,
  features,
  referral,
  popular,
}: {
  name: string;
  accent: "binance" | "bybit";
  features: string[];
  referral: string;
  popular?: boolean;
}) {
  const btn =
    accent === "binance"
      ? "bg-[#f0b90b] text-black hover:bg-[#d9a800]"
      : "bg-[#2e7cf6] text-white hover:bg-[#1f6ae0]";
  const nameColor = accent === "binance" ? "text-[#f0b90b]" : "text-foreground";
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <span className={`text-lg font-bold ${nameColor}`}>{name}</span>
        {popular && <Badge tone="brand">Most Popular</Badge>}
      </div>
      <ul className="flex flex-col gap-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-foreground">
            <span className="text-up">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <a
        href={referral}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto"
      >
        <button
          className={`flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors ${btn}`}
        >
          Sign Up on {name} ↗
        </button>
      </a>
      <p className="text-center text-xs text-muted">ⓘ Referral rewards available</p>
    </div>
  );
}

function ExchangeConnect({
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

function Flow() {
  return (
    <ol className="flex flex-col gap-5">
      <FlowStep
        n={1}
        title="Create Account"
        note="Sign up on your preferred exchange using our referral link."
      />
      <FlowStep
        n={2}
        title="Connect Your UID"
        note="Enter your UID from the exchange and submit your application."
      />
      <FlowStep n={3} title="Get Approved & Go Premium">
        <ul className="mt-1 flex flex-col gap-1 text-xs text-muted">
          <li>
            <span className="font-medium text-foreground">Bybit:</span> Approved
            automatically after UID verification. ⚡
          </li>
          <li>
            <span className="font-medium text-foreground">Binance:</span> Approved
            by our team within 24 hours. ⓘ
          </li>
        </ul>
      </FlowStep>
    </ol>
  );
}

function FlowStep({
  n,
  title,
  note,
  children,
}: {
  n: number;
  title: string;
  note?: string;
  children?: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-semibold text-foreground">
        {n}
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {note && <span className="text-xs text-muted">{note}</span>}
        {children}
      </div>
    </li>
  );
}

function PremiumBenefits() {
  const items = [
    "Full access to all news & disclosures",
    "Translated Korean DART filings in English",
    "Real-time Korean market data",
    "More features coming soon",
  ];
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-6">
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
        👑 Premium Benefits
      </p>
      <ul className="flex flex-col gap-2">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <span className="text-up">✓</span>
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
