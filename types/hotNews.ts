/**
 * Korean's Hot News (Hot in Korea) types — mirror the backend contract
 * (프론트연동_KoreansHotNews.md). Admin responses are camelCase; the public
 * Supabase views return snake_case rows that the data layer maps.
 */

import type { TickerLabel } from "@/types/news";

/** Publish state. `scheduled` becomes visible once `scheduledAt` passes. */
export type HotNewsStatus = "scheduled" | "published" | "hidden";

/** Related stock slug — identical set to the news ticker labels. */
export type RelatedStock = TickerLabel; // "samsung" | "skhynix" | "hyundai"

// ---------------------------------------------------------------------------
// Admin API (camelCase) — backend `/internal/admin/hot-news`
// ---------------------------------------------------------------------------

/** Row in the admin list (GET /hot-news). `title` is the Korean original. */
export interface HotNewsListItem {
  id: string;
  seqId: number;
  title: string;
  relatedStock: RelatedStock[];
  status: HotNewsStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Single admin item (GET /hot-news/{id}) — adds the Korean body (view-only). */
export interface HotNewsDetail extends HotNewsListItem {
  content: string;
}

/** Create request body (POST). All fields are the Korean original input. */
export interface HotNewsCreateInput {
  title: string;
  content: string;
  relatedStock: RelatedStock[];
  status: HotNewsStatus;
  /** Required (ISO 8601) when status === "scheduled"; else null. */
  scheduledAt: string | null;
}

/** Status-transition body (PATCH). Content is NOT editable — status only. */
export interface HotNewsStatusInput {
  status: HotNewsStatus;
  scheduledAt: string | null;
}

/** Create-success envelope. */
export interface HotNewsCreateResult {
  success: boolean;
  message: string;
  id: string;
}

// ---------------------------------------------------------------------------
// User-facing (mapped from the public views)
// ---------------------------------------------------------------------------

/**
 * List-card item for the Hot in Korea carousel — mapped from `hot_news_public`
 * (+ `hot_news_translations_public` overlay). Body fields are null for
 * non-premium viewers (gated in the DB view).
 */
export interface HotNewsPublicItem {
  id: string;
  seqId: number;
  /** Translated title for content locales, else the view's English title. */
  title: string;
  slug: string | null;
  tickers: RelatedStock[];
  /** coalesce(published_at, scheduled_at). */
  publishedAt: string;
  /** Short summary — null when gated (non-premium). */
  summary: string | null;
  /** Key points (≤3) — null when gated. */
  keyPoints: string[] | null;
}

/** Detail item — same shape as the list item plus the (gated) Korean-source
 * fields the gate may show. Body content is the English brief / translation,
 * never the Korean original on the user side. */
export interface HotNewsDetailItem extends HotNewsPublicItem {
  /** Full premium body — null when gated or absent. */
  content: string | null;
}

// ---------------------------------------------------------------------------
// Raw view rows (snake_case) returned by PostgREST — used by the data layer.
// ---------------------------------------------------------------------------

export interface HotNewsPublicRow {
  id: string;
  seq_id: number;
  title: string;
  slug: string | null;
  stock_ids: string[] | null;
  published_at: string;
  content: string | null;
  summary: string | null;
  key_points: string[] | null;
}

export interface HotNewsTranslationRow {
  hot_news_id: string;
  translated_title: string | null;
  summary: string | null;
  key_points: string[] | null;
}
