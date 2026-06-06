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
  n.category,
  n.subcategory,
  coalesce(n.translated_title, n.title)            as title,
  -- Short public preview built from the summary (full body stays premium).
  left(coalesce(n.summary, ''), 280)               as preview,
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
  n.category,
  n.subcategory,
  coalesce(n.translated_title, n.title)            as title,
  left(coalesce(n.summary, ''), 280)               as preview,
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
-- Grants
-- -----------------------------------------------------------------------------
grant select on public.news_preview to anon, authenticated;
grant select on public.news_full    to anon, authenticated;

-- Market board data (read by the ticker). Backend writes via service_role.
grant select on public.market_data  to anon, authenticated;

-- RLS read policy for market_data (in case it is enabled). Public reference data.
alter table public.market_data enable row level security;
drop policy if exists "market_data_select_all" on public.market_data;
create policy "market_data_select_all"
  on public.market_data for select
  using (true);
