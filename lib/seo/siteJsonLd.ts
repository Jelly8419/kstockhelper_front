import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants/site";

/**
 * Site-wide schema.org JSON-LD for Answer Engine Optimization (AEO).
 *
 * These describe the *product/brand* as an entity — distinct from the
 * per-article NewsArticle schema. They are what lets an answer engine respond
 * to "what platforms track Korean stocks in English?" or "is there a real-time
 * Korean chart comparison tool?" by naming K-Stock Helper, rather than only
 * citing an individual article.
 *
 * Emitted once on the locale layout (every user-facing page). A single `@graph`
 * groups the three connected entities (Organization, WebSite, the app) so
 * crawlers read them as one coherent description of the service.
 */
export function buildSiteJsonLd(locale: string) {
  const orgId = `${SITE_URL}/#organization`;
  const siteId = `${SITE_URL}/#website`;
  const logo = `${SITE_URL}/og-image.png`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        logo: { "@type": "ImageObject", url: logo },
      },
      {
        "@type": "WebSite",
        "@id": siteId,
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: locale,
        publisher: { "@id": orgId },
      },
      {
        // The product itself: what it does, for whom, on what platform.
        "@type": ["SoftwareApplication", "WebApplication"],
        "@id": `${SITE_URL}/#app`,
        name: SITE_NAME,
        url: SITE_URL,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        description:
          "K-Stock Helper delivers real-time Korean stock market news and " +
          "disclosures translated into English, and compares Korean stock " +
          "prices against Binance and Bybit futures in real time, for global " +
          "investors.",
        featureList: [
          "Real-time Korean stock news and disclosures in English",
          "Price Gap Monitor: live comparison of Korean stock prices vs Binance/Bybit futures",
          "Coverage of major Korean equities (Samsung, SK Hynix, Hyundai)",
        ],
        publisher: { "@id": orgId },
        // Free to use with an optional premium tier.
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
    ],
  };
}
