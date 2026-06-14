/**
 * Fraction of the summary exposed in the public preview.
 *
 * Both preview paths cut to this proportion in the DB:
 *  - English/base   → news_preview / news_full       (public.news_preview_text)
 *  - translated     → news_translations_full.summary_preview
 *
 * Keep this in sync with the 0.4 cut in public.news_preview_text()
 * (supabase/views.sql). Exported for reference/tests; the cut itself runs in
 * Postgres so the full summary never reaches non-premium clients.
 */
export const PREVIEW_RATIO = 0.4;
