import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { translate } from "@/lib/i18n/translate";
import { localizedAlternates } from "@/lib/i18n/seo";
import { SITE_URL } from "@/lib/constants/site";
import { REAL_ESTATE_HOME_PATH } from "@/lib/constants/realEstate";
import type { SupportedLocale } from "@/lib/i18n/config";
import { RealEstateHome } from "@/components/realEstate/RealEstateHome";

/**
 * Real Estate buying-support home (SEO landing). Indexed in every UI locale with
 * self-canonical + full hreflang cluster via `localizedAlternates` (SEO PRD §4-§5).
 * The slug `/buy-korean-real-estate` is fixed in English across all locales.
 */
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const dict = getDictionary(locale as SupportedLocale);
  const title = translate(dict, "realEstate.seo.homeTitle");
  const description = translate(dict, "realEstate.seo.homeDescription");

  return {
    title,
    description,
    alternates: localizedAlternates(REAL_ESTATE_HOME_PATH, locale),
    openGraph: {
      type: "website",
      siteName: "K-Stock Helper",
      title,
      description,
      locale,
      url: `${SITE_URL}/${locale}${REAL_ESTATE_HOME_PATH}`,
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

export default function RealEstateHomePage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const dict = getDictionary(locale as SupportedLocale);

  // BreadcrumbList JSON-LD: Home > Buy Korean Real Estate (SEO PRD §8).
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: translate(dict, "realEstate.seo.breadcrumbHome"),
        item: `${SITE_URL}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: translate(dict, "realEstate.seo.breadcrumbRealEstate"),
        item: `${SITE_URL}/${locale}${REAL_ESTATE_HOME_PATH}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <RealEstateHome />
    </>
  );
}
