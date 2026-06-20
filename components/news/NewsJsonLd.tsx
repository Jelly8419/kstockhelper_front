import type { NewsDetailItem } from "@/types/news";
import { buildNewsJsonLd } from "@/lib/seo/newsJsonLd";

/**
 * Emits the schema.org NewsArticle JSON-LD for a news/disclosure detail page
 * (AEO). Server-rendered into the page so answer-engine crawlers receive the
 * structured data on first fetch. Shared by the /news and /disclosures detail
 * routes, which have identical structure.
 */
export function NewsJsonLd({ item, locale }: { item: NewsDetailItem; locale: string }) {
  const jsonLd = buildNewsJsonLd(item, locale);
  return (
    <script
      type="application/ld+json"
      // schema.org payload is built from our own data; no user HTML injected.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
