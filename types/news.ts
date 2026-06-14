/** Stock tickers a news item can be labeled with. */
export type TickerLabel = "samsung" | "skhynix" | "hyundai";

/** Source category of a content item. */
export type NewsCategory = "news" | "disclosure";

/**
 * Content-type selection in the News and Disclosures section. Single-select:
 * "all" = both news and disclosures, else a specific category. Distinct from
 * `NewsCategory` (which has no "all") because the section's first tab is All.
 */
export type ContentTypeFilter = "all" | NewsCategory;

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
  /** UUID primary key — used for translation joins and internal references. */
  id: string;
  /**
   * Short auto-increment integer used as the public URL key
   * (`/news/{seqId}-{slug}`). Stable per item; detail routes resolve by this.
   */
  seqId: number;
  category: NewsCategory;
  /**
   * SEO/display slug fixed at publish time (English-title based). Null for
   * legacy rows not yet backfilled — callers fall back to a runtime slugify of
   * `title`. Decorative: detail routes match on `seqId`, not the slug.
   */
  slug: string | null;
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
  seq_id: number;
  category: NewsCategory;
  slug: string | null;
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

/**
 * A row from the `news_translations_full` view (premium-gated; PK
 * (news_id, locale)). Only translated fields: `key_figures`/`body` are never
 * translated. Backend stores the translated title under `translated_title`; we
 * map it onto our `title` field at the data layer.
 *
 * `summary_preview` (40% cut) is always present; `summary` / `key_points` are
 * the FULL translated values and arrive only for premium callers (NULL
 * otherwise — gating enforced in the view, mirroring news_full).
 */
export interface NewsTranslationRow {
  news_id: string;
  translated_title: string | null;
  /** Public in-language preview: first 40% of the translated summary. */
  summary_preview: string | null;
  /** Full translated summary. NULL for non-premium callers. */
  summary: string | null;
  /** jsonb string[] from the backend. Full value; NULL for non-premium. */
  key_points: string[] | null;
}
