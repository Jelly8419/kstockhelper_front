/** Stock tickers a news item can be labeled with. */
export type TickerLabel = "samsung" | "skhynix" | "hyundai";

/** Source category of a content item. */
export type NewsCategory = "news" | "disclosure";

/** Filter values used by the news filter tabs. */
export type NewsFilter = "all" | TickerLabel;

/** Display metadata for a ticker label. */
export interface TickerMeta {
  id: TickerLabel;
  /** Short display name, e.g. "Samsung". */
  label: string;
}

/** A single news / disclosure card item. */
export interface NewsItem {
  id: string;
  category: NewsCategory;
  /** Tickers this content is labeled with (can be multiple). */
  tickers: TickerLabel[];
  title: string;
  /** Full translated body (preview is derived from this). */
  body: string;
  /** ISO timestamp of when we registered the item (UTC). */
  publishedAt: string;
  /** Detail-page summary. */
  summary: string;
  /** Exactly three key points shown on the detail page. */
  keyPoints: [string, string, string];
}
