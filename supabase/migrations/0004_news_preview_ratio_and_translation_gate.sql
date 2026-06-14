-- =============================================================================
-- Ratio-based news preview + premium gating for translated content.
--
-- Two problems with the previous gating, confirmed against production data
-- (198 rows): the public preview was a fixed left(summary, 280) cut, so ~84% of
-- news items (shorter than the cap) were fully exposed and effectively ungated.
-- And translated locales read the base `news_translations` table directly —
-- anon-readable, no gate — so non-premium callers saw the FULL translated
-- summary + key_points, bypassing the English gating in news_full entirely.
--
-- Fixes:
--   1. news_preview_text(summary): expose a fixed 40% FRACTION of the summary
--      (word-boundary aware) instead of a fixed length. Used by news_preview
--      and news_full for the English/base preview.
--   2. news_translations_full: a premium-gated view over news_translations.
--      summary_preview (40% cut) is always present for in-language previews;
--      full summary / key_points are NULL for non-premium callers (is_premium()),
--      mirroring news_full. The frontend now reads this view, never the base
--      table.
--
-- Idempotent — safe to re-run. Depends on public.is_premium() (already present).
-- Mirrors supabase/views.sql (the canonical re-runnable definitions).
--
-- NOTE: news_preview / news_full carry seq_id + slug (the public URL key the app
-- filters on: getNewsBySeqId → .eq("seq_id", …)). An earlier draft of this file
-- omitted them; both columns are restored here. Re-run this to repair any view
-- created from that draft.
-- =============================================================================


-- 1. Ratio-based preview helper -----------------------------------------------
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

grant execute on function public.news_preview_text(text) to anon, authenticated;


-- 2. Swap the fixed-length preview for the ratio cut in both views ------------
drop view if exists public.news_preview;
create view public.news_preview as
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
  coalesce(
    array_agg(ns.stock_id) filter (where ns.stock_id is not null),
    '{}'
  )                                                 as stock_ids
from public.news n
left join public.news_stocks ns on ns.news_id = n.id
where n.status = 'published'
group by n.id;

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


-- 3. Premium-gated translation view ------------------------------------------
drop view if exists public.news_translations_full;
create view public.news_translations_full as
select
  t.news_id,
  t.locale,
  t.translated_title,
  public.news_preview_text(t.summary)                           as summary_preview,
  case when public.is_premium() then t.summary    else null end as summary,
  case when public.is_premium() then t.key_points else null end as key_points
from public.news_translations t;

comment on view public.news_translations_full is
  'Premium-gated translations. summary_preview is always present (40% cut); full summary/key_points are NULL for non-premium callers.';


-- 4. Grants -------------------------------------------------------------------
grant select on public.news_preview            to anon, authenticated;
grant select on public.news_full               to anon, authenticated;
grant select on public.news_translations_full  to anon, authenticated;
