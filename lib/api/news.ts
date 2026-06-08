import { createClient } from "@/lib/supabase/server";
import { toTickerLabels } from "@/lib/constants/tickers";
import { NEWS_PAGE_SIZE } from "@/lib/constants/news";
import {
  NewsPreview,
  NewsPreviewRow,
  NewsDetailItem,
  NewsFullRow,
  NewsFilter,
  NewsCategory,
} from "@/types/news";

const PREVIEW_COLUMNS =
  "id,category,subcategory,title,preview,source,url,is_premium,published_at,stock_ids";
const FULL_COLUMNS =
  "id,category,subcategory,title,preview,source,url,is_premium,published_at,stock_ids,body,summary,key_points,key_figures";

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
 * Two independent filters: content type (`category`) and ticker (`filter`,
 * "all" = no ticker filter). Server-side pagination + filtering.
 *
 * Pages are ordered by (published_at desc, id desc) for stable pagination —
 * a single timestamp key alone can drop/duplicate rows at page boundaries.
 */
export async function getNewsPage(
  filter: NewsFilter = "all",
  page = 0,
  pageSize = NEWS_PAGE_SIZE,
  category?: NewsCategory
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

  // PostgREST array containment filter on stock_ids.
  if (filter !== "all") {
    query = query.contains("stock_ids", [filter]);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("getNewsPage error:", error.message);
    return { items: [], hasMore: false, total: 0 };
  }

  const total = count ?? 0;
  const items = (data as NewsPreviewRow[]).map(mapPreview);
  const hasMore = from + items.length < total;
  return { items, hasMore, total };
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
