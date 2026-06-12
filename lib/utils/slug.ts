/**
 * News/disclosure detail URL helpers.
 *
 * URL shape (SEO PRD §3): `/{locale}/news/{id}-{slug}` and
 * `/{locale}/disclosures/{id}-{slug}`. The **routing key is always `id`** — the
 * slug is decorative for SEO/readability. A request with a stale or wrong slug
 * still resolves (we parse the id and serve), and the canonical tag points at
 * the correct slug.
 *
 * Slug source priority: the backend `slug` column (fixed at publish time), then
 * a runtime slugify of the English title for legacy rows not yet backfilled,
 * then the bare id when there is nothing to slugify.
 */
import type { NewsCategory } from "@/types/news";

/** Max slug length before truncation (keeps URLs readable, avoids unbounded). */
const MAX_SLUG_WORDS = 10;

/**
 * Convert an English title to a URL slug (SEO PRD §5):
 * lowercase, spaces → hyphens, strip non-alphanumerics, collapse hyphens,
 * cap length. Returns "" when the input has no slug-able characters.
 */
export function slugify(title: string | null | undefined): string {
  if (!title) return "";
  const cleaned = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, "") // trim leading/trailing hyphens
    .replace(/-{2,}/g, "-"); // collapse runs
  if (!cleaned) return "";
  return cleaned.split("-").slice(0, MAX_SLUG_WORDS).join("-");
}

/** Path segment under the locale for a given content category. */
function categorySegment(category: NewsCategory): "news" | "disclosures" {
  return category === "disclosure" ? "disclosures" : "news";
}

/**
 * Build the un-prefixed detail path (no locale) for a content item:
 *   `/news/{seqId}-{slug}` or `/disclosures/{seqId}-{slug}`.
 *
 * `seqId` is the public integer URL key. `slug` is the backend column (may be
 * null); falls back to slugify(title), then to the bare seqId. The leading
 * `{seqId}-` is always present so `parseDetailParam` can recover the id.
 */
export function buildDetailPath(
  category: NewsCategory,
  seqId: number,
  slug: string | null | undefined,
  title?: string | null
): string {
  const seg = categorySegment(category);
  const resolved = (slug && slug.trim()) || slugify(title);
  const tail = resolved ? `${seqId}-${resolved}` : String(seqId);
  return `/${seg}/${tail}`;
}

/**
 * Recover the integer `seqId` from a `{seqId}-{slug}` route param.
 *
 * The seq_id is a positive-integer prefix; the slug (if any) follows the first
 * hyphen. Returns NaN when the param does not start with digits, so callers can
 * treat a malformed URL as not-found.
 *
 *   "12345-samsung-hbm" → 12345
 *   "12345"             → 12345
 *   "samsung-hbm"       → NaN
 */
export function parseDetailParam(param: string): number {
  const m = param.match(/^(\d+)/);
  return m ? Number(m[1]) : NaN;
}
