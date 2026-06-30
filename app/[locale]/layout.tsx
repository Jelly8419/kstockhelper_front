import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { Gnb } from "@/components/layout/Gnb";
import { Footer } from "@/components/layout/Footer";
import { RealEstateGnb } from "@/components/layout/RealEstateGnb";
import { SiteJsonLd } from "@/components/seo/SiteJsonLd";
import { routing } from "@/lib/i18n/routing";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { translate } from "@/lib/i18n/translate";
import { localizedAlternates } from "@/lib/i18n/seo";
import type { SupportedLocale } from "@/lib/i18n/config";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Locale-aware SEO metadata for user-facing pages (PRD: SEO). Title/description
 * come from the locale's `seo.*` keys (en fallback). hreflang alternates +
 * x-default are emitted for the home route; deeper routes can override.
 */
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const dict = getDictionary(locale as SupportedLocale);
  const title = translate(dict, "seo.title");
  const description = translate(dict, "seo.description");

  return {
    title,
    description,
    alternates: localizedAlternates("/", locale),
    openGraph: {
      type: "website",
      siteName: "K-Stock Helper",
      title,
      description,
      locale,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "K-Stock Helper" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  // SiteChrome picks the chrome by path on the client (usePathname): Real Estate
  // pages get the light theme + dedicated GNB (no footer); everything else gets
  // the default dark Gnb + Footer. Doing this client-side keeps the page static
  // and avoids depending on a request header that next-intl's response drops.
  return (
    <NextIntlClientProvider messages={messages}>
      <SiteJsonLd locale={locale} />
      <SiteChrome
        gnb={<Gnb />}
        footer={<Footer />}
        realEstateGnb={<RealEstateGnb />}
      >
        {children}
      </SiteChrome>
    </NextIntlClientProvider>
  );
}
