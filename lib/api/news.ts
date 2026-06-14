import { createClient } from "@/lib/supabase/server";
import { toTickerLabels } from "@/lib/constants/tickers";
import { NEWS_PAGE_SIZE } from "@/lib/constants/news";
import type { ContentLocale } from "@/lib/i18n/config";
import {
  NewsPreview,
  NewsPreviewRow,
  NewsDetailItem,
  NewsFullRow,
  NewsTranslationRow,
  NewsCategory,
  TickerLabel,
} from "@/types/news";

const PREVIEW_COLUMNS =
  "id,seq_id,category,slug,subcategory,title,preview,source,url,is_premium,published_at,stock_ids";
const FULL_COLUMNS =
  "id,seq_id,category,slug,subcategory,title,preview,source,url,is_premium,published_at,stock_ids,body,summary,key_points,key_figures";

/**
 * Translated fields fetched from `news_translations_full` (the premium-gated
 * view) for a content locale. `summary_preview` (40% cut) is always present;
 * full `summary` / `key_points` are NULL for non-premium callers — the gate is
 * enforced in the DB view, matching news_full. Never read the base
 * `news_translations` table directly: it exposes full premium content to anon.
 */
const TRANSLATION_COLUMNS =
  "news_id,translated_title,summary_preview,summary,key_points";

export interface NewsPage {
  items: NewsPreview[];
  /** Whether more pages exist after this one. */
  hasMore: boolean;
  /** Total number of items matching the filter (for pagination). */
  total: number;
}

function mapPreview(row: NewsPreviewRow): NewsPreview {
  return {
    id: row.id,
    seqId: row.seq_id,
    category: row.category,
    slug: row.slug,
    subcategory: row.subcategory,
    title: row.title,
    preview: row.preview ?? "",
    source: row.source,
    url: row.url,
    isPremium: row.is_premium,
    publishedAt: row.published_at,
    tickers: toTickerLabels(row.stock_ids),
  };
}

function mapFull(row: NewsFullRow): NewsDetailItem {
  return {
    ...mapPreview(row),
    body: row.body,
    summary: row.summary,
    keyPoints: row.key_points,
    keyFigures: row.key_figures,
  };
}

/**
 * Overlay a `news_translations` row onto an already-mapped English item.
 *
 * Explicit field mapping (NOT a spread) because the backend's translated title
 * lives under `translated_title` while our item uses `title` — a blind spread
 * would leave the English title in place. Untranslated fields (body, tickers,
 * key_figures, source, url, dates) are kept as-is. Any missing translated field
 * falls back to the English value already on `item`.
 *
 * `preview` (list cards / gate UI) is NOT translated directly; the DB view
 * supplies `summary_preview` — the translated summary already cut to 40% — so
 * the public preview reads in-language without ever shipping the full summary.
 * Full `summary` / `key_points` arrive only for premium callers (NULL otherwise,
 * gated in news_translations_full); we overlay them only when present so a gated
 * NULL never wipes the content the page would otherwise show.
 */
function applyTranslation<T extends NewsPreview>(
  item: T,
  t: NewsTranslationRow | undefined
): T {
  if (!t) return item;
  const next: T = { ...item };
  if (t.translated_title) next.title = t.translated_title;
  // In-language public preview — already 40%-cut in the DB view.
  if (t.summary_preview) next.preview = t.summary_preview;

  // Detail-only fields: only present on NewsDetailItem. Narrow via a property
  // probe so the same helper serves both list (NewsPreview) and detail items.
  // These are premium-gated in the view (NULL for non-premium callers).
  if (isDetailItem(next)) {
    if (t.summary) next.summary = t.summary;
    if (t.key_points) next.keyPoints = t.key_points;
  }
  return next;
}

/** True when an item carries the detail-only fields (summary/keyPoints/body). */
function isDetailItem(item: NewsPreview): item is NewsDetailItem {
  return "summary" in item && "keyPoints" in item;
}

/**
 * Fetch translations for a set of news ids in one query (avoids N+1).
 * Returns a Map keyed by news_id. Empty when locale is null (English source)
 * or on error — callers then keep the English content.
 */
async function fetchTranslations(
  ids: string[],
  locale: ContentLocale | null
): Promise<Map<string, NewsTranslationRow>> {
  const map = new Map<string, NewsTranslationRow>();
  if (!locale || ids.length === 0) return map;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("news_translations_full")
    .select(TRANSLATION_COLUMNS)
    .in("news_id", ids)
    .eq("locale", locale);

  if (error) {
    // Missing translations must never break the page — fall back to English.
    console.error("fetchTranslations error:", error.message);
    return map;
  }
  for (const row of (data ?? []) as NewsTranslationRow[]) {
    map.set(row.news_id, row);
  }
  return map;
}

/**
 * Fetch one page of the published news list (preview view).
 * Two independent filters, applied AND:
 *  - content type (`category`, omit for "all" = both news and disclosures)
 *  - companies (`tickers`, empty = no company filter). Multi-select with OR
 *    matching: an item shows if it carries *any* of the selected tickers.
 * Server-side pagination + filtering.
 *
 * Pages are ordered by (published_at desc, id desc) for stable pagination —
 * a single timestamp key alone can drop/duplicate rows at page boundaries.
 */
export async function getNewsPage(
  tickers: TickerLabel[] = [],
  page = 0,
  pageSize = NEWS_PAGE_SIZE,
  category?: NewsCategory,
  contentLocale: ContentLocale | null = null
): Promise<NewsPage> {
  const supabase = createClient();
  const from = page * pageSize;
  const to = from + pageSize - 1; // exact page window

  let query = supabase
    .from("news_preview")
    .select(PREVIEW_COLUMNS, { count: "exact" })
    .order("published_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

  // Content-type filter (news vs disclosure).
  if (category) {
    query = query.eq("category", category);
  }

  // Company filter: OR match — keep rows whose stock_ids overlap the selection.
  if (tickers.length > 0) {
    query = query.overlaps("stock_ids", tickers);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("getNewsPage error:", error.message);
    return { items: [], hasMore: false, total: 0 };
  }

  const total = count ?? 0;
  const englishItems = (data as NewsPreviewRow[]).map(mapPreview);

  // Overlay translations for this page in a single in(ids) query (no N+1).
  // For en / non-content locales this is a no-op (empty map → English kept).
  const translations = await fetchTranslations(
    englishItems.map((i) => i.id),
    contentLocale
  );
  const items = englishItems.map((i) =>
    applyTranslation(i, translations.get(i.id))
  );

  const hasMore = from + items.length < total;
  return { items, hasMore, total };
}

/**
 * Fetch a single news item detail (full view) by its public `seq_id` — the
 * integer carried in the URL (`/news/{seqId}-{slug}`). Returns null if not found
 * or if `seqId` is not a valid positive integer (e.g. a malformed URL).
 *
 * The translation join uses the row's UUID (`item.id`), NOT the seq_id:
 * `news_translations.news_id` is the UUID FK. When `contentLocale` is a
 * translated locale, title/summary/key_points become in-language; body and
 * key_figures stay English. Missing translation → English content kept.
 */
export async function getNewsBySeqId(
  seqId: number,
  contentLocale: ContentLocale | null = null
): Promise<NewsDetailItem | null> {
  if (!Number.isInteger(seqId) || seqId <= 0) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("news_full")
    .select(FULL_COLUMNS)
    .eq("seq_id", seqId)
    .maybeSingle();

  if (error) {
    console.error("getNewsBySeqId error:", error.message);
    return null;
  }
  if (!data) return null;

  const item = mapFull(data as NewsFullRow);

  if (!contentLocale) return item;

  const { data: trans, error: transError } = await supabase
    .from("news_translations_full")
    .select(TRANSLATION_COLUMNS)
    .eq("news_id", item.id)
    .eq("locale", contentLocale)
    .maybeSingle();

  if (transError) {
    // Missing translation must not break the page — keep English.
    console.error("getNewsBySeqId translation error:", transError.message);
    return item;
  }

  return applyTranslation(item, (trans as NewsTranslationRow | null) ?? undefined);
}

export interface NewsSitemapEntry {
  seqId: number;
  category: NewsCategory;
  slug: string | null;
  publishedAt: string;
}

/**
 * Fetch all published news/disclosure rows for the sitemap (seq_id, category,
 * slug, timestamp). `seq_id` is the public URL key; `category` routes each entry
 * to `/news/` vs `/disclosures/`; `slug` builds the SEO URL. Capped to avoid an
 * unbounded sitemap as data grows.
 */
export async function getNewsSitemapEntries(
  limit = 5000
): Promise<NewsSitemapEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("news_preview")
    .select("seq_id,category,slug,published_at")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("getNewsSitemapEntries error:", error?.message);
    return [];
  }
  return (
    data as {
      seq_id: number;
      category: NewsCategory;
      slug: string | null;
      published_at: string;
    }[]
  ).map((r) => ({
    seqId: r.seq_id,
    category: r.category,
    slug: r.slug,
    publishedAt: r.published_at,
  }));
}
