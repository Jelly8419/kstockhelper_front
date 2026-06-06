import { createClient } from "@/lib/supabase/server";
import { toTickerLabels } from "@/lib/constants/tickers";
import {
  NewsPreview,
  NewsPreviewRow,
  NewsDetailItem,
  NewsFullRow,
  NewsFilter,
} from "@/types/news";

const PREVIEW_COLUMNS =
  "id,category,subcategory,title,preview,source,url,is_premium,published_at,stock_ids";
const FULL_COLUMNS =
  "id,category,subcategory,title,preview,source,url,is_premium,published_at,stock_ids,body,summary,key_points,key_figures";

/** Number of items per page for the news feed. */
export const NEWS_PAGE_SIZE = 20;

export interface NewsPage {
  items: NewsPreview[];
  /** Whether more pages exist after this one. */
  hasMore: boolean;
}

function mapPreview(row: NewsPreviewRow): NewsPreview {
  return {
    id: row.id,
    category: row.category,
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
 * Fetch one page of the published news list (preview view).
 * Filter by ticker ("all" = no filter). Server-side pagination + filtering.
 *
 * Pages are ordered by (published_at desc, id desc) for stable pagination —
 * a single timestamp key alone can drop/duplicate rows at page boundaries.
 */
export async function getNewsPage(
  filter: NewsFilter = "all",
  page = 0,
  pageSize = NEWS_PAGE_SIZE
): Promise<NewsPage> {
  const supabase = createClient();
  const from = page * pageSize;
  // Fetch one extra row to detect whether more pages exist.
  const to = from + pageSize; // inclusive end → pageSize+1 rows

  let query = supabase
    .from("news_preview")
    .select(PREVIEW_COLUMNS)
    .order("published_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

  // PostgREST array containment filter on stock_ids.
  if (filter !== "all") {
    query = query.contains("stock_ids", [filter]);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getNewsPage error:", error.message);
    return { items: [], hasMore: false };
  }

  const rows = data as NewsPreviewRow[];
  const hasMore = rows.length > pageSize;
  const items = rows.slice(0, pageSize).map(mapPreview);
  return { items, hasMore };
}

/** Fetch a single news item detail (full view). Returns null if not found. */
export async function getNewsById(id: string): Promise<NewsDetailItem | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("news_full")
    .select(FULL_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getNewsById error:", error.message);
    return null;
  }
  if (!data) return null;
  return mapFull(data as NewsFullRow);
}

export interface NewsSitemapEntry {
  id: string;
  publishedAt: string;
}

/**
 * Fetch all published news ids + timestamps for the sitemap.
 * Capped to avoid an unbounded sitemap as data grows.
 */
export async function getNewsSitemapEntries(
  limit = 5000
): Promise<NewsSitemapEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("news_preview")
    .select("id,published_at")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("getNewsSitemapEntries error:", error?.message);
    return [];
  }
  return (data as { id: string; published_at: string }[]).map((r) => ({
    id: r.id,
    publishedAt: r.published_at,
  }));
}
