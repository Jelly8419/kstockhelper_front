import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";
import { Gnb } from "@/components/layout/Gnb";
import { Footer } from "@/components/layout/Footer";
import { RealEstateGnb } from "@/components/layout/RealEstateGnb";
import { SiteJsonLd } from "@/components/seo/SiteJsonLd";
import { routing } from "@/lib/i18n/routing";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { translate } from "@/lib/i18n/translate";
import { localizedAlternates } from "@/lib/i18n/seo";
import { PATHNAME_HEADER } from "@/lib/admin/constants";
import { REAL_ESTATE_HOME_PATH } from "@/lib/constants/realEstate";
import type { SupportedLocale } from "@/lib/i18n/config";

/** Whether the current path is a Real Estate page (home or request). */
function isRealEstatePath(pathname: string): boolean {
  // Matches `/{locale}/buy-korean-real-estate` and its `/request` child.
  return pathname.includes(REAL_ESTATE_HOME_PATH);
}

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

  // Real Estate pages (k-property revisions §3-§4): light theme + dedicated GNB,
  // no footer. Detected from the middleware-set pathname header. Reading headers()
  // makes this layout dynamic, which is fine — the Real Estate pages opt into the
  // distinct chrome and the rest still renders normally.
  const pathname = headers().get(PATHNAME_HEADER) ?? "";
  const realEstate = isRealEstatePath(pathname);

  if (realEstate) {
    return (
      <NextIntlClientProvider messages={messages}>
        <SiteJsonLd locale={locale} />
        <div className="theme-realestate-light flex min-h-screen flex-col bg-background text-foreground">
          <RealEstateGnb />
          <main className="flex-1">{children}</main>
        </div>
      </NextIntlClientProvider>
    );
  }

  return (
    <NextIntlClientProvider messages={messages}>
      <SiteJsonLd locale={locale} />
      <Gnb />
      <main className="flex-1">{children}</main>
      <Footer />
    </NextIntlClientProvider>
  );
}
