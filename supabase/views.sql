-- =============================================================================
-- K-Stock Helper — frontend-facing views (re-definition)
--
-- The frontend reads ONLY these views, never the base `news` table.
-- They map the backend's real columns (translated_title / english_translation /
-- key_figures / status / subcategory) to a clean, English, premium-gated shape.
--
-- Run this in the Supabase SQL Editor. Safe to re-run (create or replace).
-- Depends on: public.is_premium()  (already present in the DB).
-- =============================================================================


-- -----------------------------------------------------------------------------
-- news_preview_text(summary) — ratio-based public preview (40% of the summary).
--
-- Previously preview was a fixed left(summary, 280) cut. With real data that
-- left ~84% of news items (and 100% of translated-locale views) effectively
-- ungated, since most summaries are shorter than the fixed cap. We now expose a
-- fixed FRACTION of the summary so the gated portion scales with length.
--
-- Cut at 40% of the character length, then back off to the last word boundary
-- (trailing partial word + whitespace removed) so the preview never ends
-- mid-word. Languages without spaces (e.g. Korean) keep the raw char cut.
-- Keep this fraction in sync with PREVIEW_RATIO in lib/utils/truncate.ts.
-- -----------------------------------------------------------------------------
create or replace function public.news_preview_text(summary text)
returns text
language sql
immutable
as $$
  select case
    when summary is null or summary = '' then ''
    else
      -- 40% char cut, then trim a trailing partial word (keep full words only).
      regexp_replace(
        left(summary, greatest(1, (char_length(summary) * 0.4)::int)),
        '\s+\S*$', ''
      )
  end;
$$;


-- -----------------------------------------------------------------------------
-- news_preview — PUBLIC list view (guests / free / premium all see this)
--   * Only published rows (status = 'published') so summary-less rows never show.
--   * Title uses the English translated_title (falls back to raw title).
--   * preview is derived from summary (no full body exposed here).
--
-- NOTE: dropped first because the column order/names changed from the old
-- definition (create-or-replace cannot rename/reorder existing view columns).
-- -----------------------------------------------------------------------------
drop view if exists public.news_preview;
create view public.news_preview as
select
  n.id,
  n.seq_id,
  n.slug,
  n.category,
  n.subcategory,
  coalesce(n.translated_title, n.title)            as title,
  -- Short public preview: first 40% of the summary (full body stays premium).
  public.news_preview_text(n.summary)              as preview,
  n.source,
  n.url,
  n.is_premium,
  n.published_at,
  coalesce(
    array_agg(ns.stock_id) filter (where ns.stock_id is not null),
    '{}'
  )                                                 as stock_ids
from public.news n
left join public.news_stocks ns on ns.news_id = n.id
where n.status = 'published'
group by n.id;

comment on view public.news_preview is
  'Public, published-only news preview (English). No premium body content.';


-- -----------------------------------------------------------------------------
-- news_full — DETAIL view with premium gating
--   * Premium-only fields (body / summary / key_points / key_figures) are
--     returned only when is_premium() is true; otherwise NULL.
--   * Non-premium callers still get title/preview/meta so the gate UI can render.
-- -----------------------------------------------------------------------------
drop view if exists public.news_full;
create view public.news_full as
select
  n.id,
  n.seq_id,
  n.slug,
  n.category,
  n.subcategory,
  coalesce(n.translated_title, n.title)            as title,
  public.news_preview_text(n.summary)              as preview,
  n.source,
  n.url,
  n.is_premium,
  n.published_at,
  -- Premium-gated fields:
  case when public.is_premium() then n.english_translation else null end as body,
  case when public.is_premium() then n.summary             else null end as summary,
  case when public.is_premium() then n.key_points          else null end as key_points,
  case when public.is_premium() then n.key_figures         else null end as key_figures,
  coalesce(
    array_agg(ns.stock_id) filter (where ns.stock_id is not null),
    '{}'
  )                                                 as stock_ids
from public.news n
left join public.news_stocks ns on ns.news_id = n.id
where n.status = 'published'
group by n.id;

comment on view public.news_full is
  'Published news detail. Premium fields (body/summary/key_points/key_figures) are NULL for non-premium callers.';


-- -----------------------------------------------------------------------------
-- news_translations_full — premium-gated translation view
--
-- The base `news_translations` table is anon-readable and carries the FULL
-- translated summary + key_points. Reading it directly let non-premium callers
-- bypass the English gating in news_full and see the entire premium content in
-- any translated locale. The frontend must read THIS view instead so the same
-- is_premium() gate applies to translated content.
--
--   * translated_title      → always (public header / SEO)
--   * summary_preview        → always: first 40% of the translated summary
--                              (in-language preview for list cards & the gate UI)
--   * summary / key_points   → premium only; NULL otherwise
-- -----------------------------------------------------------------------------
drop view if exists public.news_translations_full;
create view public.news_translations_full as
select
  t.news_id,
  t.locale,
  t.translated_title,
  public.news_preview_text(t.summary)                                  as summary_preview,
  case when public.is_premium() then t.summary    else null end        as summary,
  case when public.is_premium() then t.key_points else null end        as key_points
from public.news_translations t;

comment on view public.news_translations_full is
  'Premium-gated translations. summary_preview is always present (40% cut); full summary/key_points are NULL for non-premium callers.';


-- -----------------------------------------------------------------------------
-- Grants
-- -----------------------------------------------------------------------------
grant select  on public.news_preview            to anon, authenticated;
grant select  on public.news_full               to anon, authenticated;
grant select  on public.news_translations_full  to anon, authenticated;
grant execute on function public.news_preview_text(text) to anon, authenticated;

-- Market board data (read by the ticker). Backend writes via service_role.
grant select on public.market_data  to anon, authenticated;

-- RLS read policy for market_data (in case it is enabled). Public reference data.
alter table public.market_data enable row level security;
drop policy if exists "market_data_select_all" on public.market_data;
create policy "market_data_select_all"
  on public.market_data for select
  using (true);
