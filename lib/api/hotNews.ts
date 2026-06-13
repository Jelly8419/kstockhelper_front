import { createClient } from "@/lib/supabase/server";
import { toTickerLabels } from "@/lib/constants/tickers";
import { HOT_NEWS_LIMIT } from "@/lib/constants/hotNews";
import type { ContentLocale } from "@/lib/i18n/config";
import type {
  HotNewsDetailItem,
  HotNewsPublicItem,
  HotNewsPublicRow,
  HotNewsTranslationRow,
} from "@/types/hotNews";

/**
 * Hot in Korea data layer — mirrors lib/api/news.ts but reads the dedicated
 * public views (`hot_news_public`, `hot_news_translations_public`) via the anon
 * client. Body fields (summary/keyPoints/content) come back null for non-premium
 * viewers (gated in the DB view); the detail gate handles the locked state.
 */

const LIST_COLUMNS = "id,seq_id,title,slug,stock_ids,published_at,summary,key_points";
const DETAIL_COLUMNS = `${LIST_COLUMNS},content`;
const TRANSLATION_COLUMNS = "hot_news_id,translated_title,summary,key_points";

function mapBase(row: HotNewsPublicRow): HotNewsPublicItem {
  return {
    id: row.id,
    seqId: row.seq_id,
    title: row.title,
    slug: row.slug,
    tickers: toTickerLabels(row.stock_ids),
    publishedAt: row.published_at,
    summary: row.summary,
    keyPoints: row.key_points,
  };
}

/**
 * Overlay a translation row onto an English-mapped item. The backend stores the
 * translated title under `translated_title`; summary/key_points are gated (null
 * for non-premium). Missing translated fields keep the English value.
 */
function applyTranslation<T extends HotNewsPublicItem>(
  item: T,
  t: HotNewsTranslationRow | undefined
): T {
  if (!t) return item;
  const next: T = { ...item };
  if (t.translated_title) next.title = t.translated_title;
  // summary/keyPoints are null when gated; only overlay when present.
  if (t.summary != null) next.summary = t.summary;
  if (t.key_points != null) next.keyPoints = t.key_points;
  return next;
}

/** Fetch translations for a set of hot-news ids in one query (no N+1). */
async function fetchTranslations(
  ids: string[],
  locale: ContentLocale | null
): Promise<Map<string, HotNewsTranslationRow>> {
  const map = new Map<string, HotNewsTranslationRow>();
  if (!locale || ids.length === 0) return map;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("hot_news_translations_public")
    .select(TRANSLATION_COLUMNS)
    .in("hot_news_id", ids)
    .eq("locale", locale);

  if (error) {
    // Missing translations must never break the page — fall back to English.
    console.error("hot news fetchTranslations error:", error.message);
    return map;
  }
  for (const row of (data ?? []) as HotNewsTranslationRow[]) {
    map.set(row.hot_news_id, row);
  }
  return map;
}

/**
 * Fetch the Hot in Korea list for the carousel — published or due-scheduled
 * items (the view applies the lazy filter), newest-first. Capped at
 * HOT_NEWS_LIMIT. Empty array on error so the home page never breaks.
 */
export async function getHotNewsList(
  contentLocale: ContentLocale | null = null
): Promise<HotNewsPublicItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("hot_news_public")
    .select(LIST_COLUMNS)
    .order("published_at", { ascending: false })
    .limit(HOT_NEWS_LIMIT);

  if (error) {
    console.error("getHotNewsList error:", error.message);
    return [];
  }

  const items = (data as HotNewsPublicRow[]).map(mapBase);
  const translations = await fetchTranslations(
    items.map((i) => i.id),
    contentLocale
  );
  return items.map((i) => applyTranslation(i, translations.get(i.id)));
}

/**
 * Fetch a single Hot in Korea item by its public `seq_id` (the integer in the
 * detail URL). Returns null if not found or `seqId` is invalid. Body fields are
 * null for non-premium callers (DB gate) — the detail gate handles locking.
 */
export async function getHotNewsBySeqId(
  seqId: number,
  contentLocale: ContentLocale | null = null
): Promise<HotNewsDetailItem | null> {
  if (!Number.isInteger(seqId) || seqId <= 0) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("hot_news_public")
    .select(DETAIL_COLUMNS)
    .eq("seq_id", seqId)
    .maybeSingle();

  if (error) {
    console.error("getHotNewsBySeqId error:", error.message);
    return null;
  }
  if (!data) return null;

  const row = data as HotNewsPublicRow & { content: string | null };
  const item: HotNewsDetailItem = { ...mapBase(row), content: row.content };

  if (!contentLocale) return item;

  const { data: trans, error: transError } = await supabase
    .from("hot_news_translations_public")
    .select(TRANSLATION_COLUMNS)
    .eq("hot_news_id", item.id)
    .eq("locale", contentLocale)
    .maybeSingle();

  if (transError) {
    console.error("getHotNewsBySeqId translation error:", transError.message);
    return item;
  }

  return applyTranslation(
    item,
    (trans as HotNewsTranslationRow | null) ?? undefined
  );
}
