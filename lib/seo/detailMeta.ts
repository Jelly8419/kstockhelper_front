import type { Metadata } from "next";
import type { NewsDetailItem } from "@/types/news";
import { SITE_URL } from "@/lib/constants/site";
import { TICKER_LABEL } from "@/lib/constants/tickers";
import { contentDetailAlternates } from "@/lib/i18n/seo";
import { buildDetailPath } from "@/lib/utils/slug";
import type { TranslateFn } from "@/lib/i18n/translate";

/**
 * Build SEO metadata for a news/disclosure detail page (PRD §8-§10):
 * title, description, canonical/hreflang alternates, and Open Graph.
 *
 * - title: `{article title} | {suffix}` (suffix is i18n `seo.newsTitleSuffix`)
 * - description: category-specific i18n template (`seo.newsDescription` /
 *   `seo.disclosureDescription`)
 * - alternates: 6-locale content policy via `contentDetailAlternates`
 * - canonical path uses the SAME `{id}-{slug}` the route resolves to, so the
 *   canonical/og:url always carry the correct slug even on a stale-slug request.
 */
export function buildDetailMetadata(
  item: NewsDetailItem,
  locale: string,
  t: TranslateFn
): Metadata {
  const path = buildDetailPath(item.category, item.seqId, item.slug, item.title);
  const alternates = contentDetailAlternates(path, locale);

  const suffix = t("seo.newsTitleSuffix");
  const title = suffix ? `${item.title} | ${suffix}` : item.title;

  const description =
    item.category === "disclosure"
      ? t("seo.disclosureDescription")
      : t("seo.newsDescription");

  // og:url points at the canonical (self for SEO locales, en otherwise).
  const canonical =
    typeof alternates?.canonical === "string"
      ? alternates.canonical
      : `${SITE_URL}/${locale}${path}`;

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      siteName: t("seo.newsTitleSuffix") || undefined,
    },
  };
}

/** Human-readable related-stock labels for the public header (PRD §4). */
export function relatedStockLabels(item: NewsDetailItem): string[] {
  return item.tickers.map((ticker) => TICKER_LABEL[ticker]);
}
