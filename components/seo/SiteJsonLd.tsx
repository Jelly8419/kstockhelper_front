import { buildSiteJsonLd } from "@/lib/seo/siteJsonLd";

/**
 * Emits site-wide Organization / WebSite / SoftwareApplication JSON-LD (AEO).
 * Rendered once in the locale layout so every user-facing page carries the
 * brand/product entity description for answer-engine crawlers.
 */
export function SiteJsonLd({ locale }: { locale: string }) {
  const jsonLd = buildSiteJsonLd(locale);
  return (
    <script
      type="application/ld+json"
      // schema.org payload built from our own constants; no user HTML injected.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
