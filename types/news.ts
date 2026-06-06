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

/** A single quantitative figure extracted from a disclosure. */
export interface KeyFigure {
  label: string;
  value: string;
}

/**
 * List-card item — maps to the `news_preview` view (public, published-only).
 * No premium body content here.
 */
export interface NewsPreview {
  id: string;
  category: NewsCategory;
  /** Backend subcategory (e.g. "CUSTOMER"); null for most disclosures. */
  subcategory: string | null;
  /** English title (translated_title, falls back to raw title). */
  title: string;
  /** Short public preview derived from the summary. */
  preview: string;
  /** "DART" | "NAVER" | ... */
  source: string | null;
  /** Original article / filing URL. */
  url: string | null;
  isPremium: boolean;
  /** ISO timestamp (UTC) of when we registered the item. */
  publishedAt: string;
  /** Tickers this content is labeled with (can be multiple). */
  tickers: TickerLabel[];
}

/**
 * Detail item — maps to the `news_full` view.
 * Premium fields (body / summary / keyPoints / keyFigures) are null for
 * non-premium callers (gating is enforced in the DB view).
 */
export interface NewsDetailItem extends NewsPreview {
  /** Full translated body (english_translation). Null if gated. */
  body: string | null;
  /** Detail-page summary. Null if gated. */
  summary: string | null;
  /** Key points (variable length, up to 3). Null if gated. */
  keyPoints: string[] | null;
  /** Quantitative figures (disclosures only). Null if gated or none. */
  keyFigures: KeyFigure[] | null;
}

// ---------------------------------------------------------------------------
// Raw row shapes returned by PostgREST (snake_case) — used by the data layer.
// ---------------------------------------------------------------------------

export interface NewsPreviewRow {
  id: string;
  category: NewsCategory;
  subcategory: string | null;
  title: string;
  preview: string | null;
  source: string | null;
  url: string | null;
  is_premium: boolean;
  published_at: string;
  stock_ids: string[] | null;
}

export interface NewsFullRow extends NewsPreviewRow {
  body: string | null;
  summary: string | null;
  key_points: string[] | null;
  key_figures: KeyFigure[] | null;
}
