import type { NewsDetailItem } from "@/types/news";
import { SITE_URL, SITE_NAME } from "@/lib/constants/site";
import { TICKER_LABEL } from "@/lib/constants/tickers";
import { buildDetailPath } from "@/lib/utils/slug";

/**
 * Build a schema.org NewsArticle JSON-LD object for a news/disclosure detail
 * page (Answer Engine Optimization).
 *
 * Structured data lets answer engines (ChatGPT, Perplexity, Google AI
 * Overviews, …) read the article as discrete facts — headline, publish date,
 * publisher, and the companies it is `about` — rather than scraping prose. That
 * is what makes the content eligible to be cited in AI-generated answers.
 *
 * `about` maps each labeled ticker to an Organization entity so the engine can
 * connect the article to "Samsung", "SK Hynix", etc. `isAccessibleForFree`
 * reflects the premium gate so engines don't over-promise gated body content.
 *
 * Render the returned object as `JSON.stringify(...)` inside a
 * `<script type="application/ld+json">` tag.
 */
export function buildNewsJsonLd(item: NewsDetailItem, locale: string) {
  const path = buildDetailPath(item.category, item.seqId, item.slug, item.title);
  const url = `${SITE_URL}/${locale}${path}`;

  const about = item.tickers.map((ticker) => ({
    "@type": "Organization",
    name: TICKER_LABEL[ticker],
  }));

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    // Public preview is always present; full summary may be gated (null).
    description: item.summary ?? item.preview,
    datePublished: item.publishedAt,
    dateModified: item.publishedAt,
    inLanguage: locale,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isAccessibleForFree: !item.isPremium,
    // The original filing/article we summarized, when known.
    ...(item.url ? { isBasedOn: item.url } : {}),
    // Source feed (DART, NAVER, …) as the article's stated origin.
    ...(item.source ? { sourceOrganization: { "@type": "Organization", name: item.source } } : {}),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/og-image.png`,
      },
    },
    ...(about.length ? { about } : {}),
  };
}
