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
 * Fetch the published news list (preview view).
 * Optionally filter by ticker; "all" returns everything.
 */
export async function getNewsList(filter: NewsFilter = "all"): Promise<NewsPreview[]> {
  const supabase = createClient();
  let query = supabase
    .from("news_preview")
    .select(PREVIEW_COLUMNS)
    .order("published_at", { ascending: false });

  // PostgREST array containment filter on stock_ids.
  if (filter !== "all") {
    query = query.contains("stock_ids", [filter]);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getNewsList error:", error.message);
    return [];
  }
  return (data as NewsPreviewRow[]).map(mapPreview);
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
