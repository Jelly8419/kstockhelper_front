-- =============================================================================
-- Analytics events (MVP conversion-funnel logging).
--
-- The frontend logs events by inserting DIRECTLY into this table from the
-- browser (anon/authenticated supabase-js), bypassing any API route. Rationale:
-- production runs on Vercel Hobby, where serverless function quotas are tight —
-- a per-event API route would burn them fast. Direct insert keeps logging off
-- the function path entirely. (See 백엔드요청_이벤트로그_애널리틱스.md.)
--
-- Structure: event_name + a few hot analytics columns (filtered/grouped often)
-- + a `properties` jsonb for per-event variable fields. Guest events are kept
-- (user_id NULL).
--
-- RLS: INSERT only. SELECT/UPDATE/DELETE are denied for anon/authenticated
-- (no policy → default deny on an RLS-enabled table). Analytics is read via the
-- views below (definer rights bypass the SELECT denial) or service_role.
--
-- Idempotent — safe to re-run.
-- =============================================================================

create table if not exists public.events (
  id                 uuid primary key default gen_random_uuid(),
  event_name         text not null,
  user_id            uuid references auth.users (id) on delete set null,  -- NULL = guest
  country_code       text,        -- 'US' | 'VN' | 'KR' ... (from Vercel edge geo)
  country_group      text,        -- 'restricted' | 'allowed'
  membership_status  text,        -- 'guest' | 'basic' | 'premium'
  device_type        text,        -- 'desktop' | 'mobile' | 'tablet'
  page_path          text,        -- e.g. '/en/price-gap'
  properties         jsonb not null default '{}'::jsonb,  -- per-event fields + locale + (future) premium_source
  created_at         timestamptz not null default now()
);

create index if not exists events_created_at_idx on public.events (created_at desc);
create index if not exists events_event_name_idx on public.events (event_name, created_at desc);
create index if not exists events_user_id_idx    on public.events (user_id);

-- -----------------------------------------------------------------------------
-- Table-level grants. RLS decides WHICH rows; GRANT decides whether the role may
-- touch the table at all. Newly created tables don't always inherit INSERT for
-- anon/authenticated, so grant it explicitly (no SELECT/UPDATE/DELETE → reads
-- and edits stay blocked even before RLS). Reads happen via service_role / the
-- analytics views.
-- -----------------------------------------------------------------------------
grant insert on table public.events to anon, authenticated;

-- -----------------------------------------------------------------------------
-- RLS: INSERT only (same pattern as 0003_waitlist.sql).
-- -----------------------------------------------------------------------------
alter table public.events enable row level security;

-- Authenticated users may insert only rows tagged with their own id (no spoofing).
drop policy if exists "events_insert_authenticated" on public.events;
create policy "events_insert_authenticated" on public.events
  for insert to authenticated
  with check (auth.uid() = user_id);

-- Guests (anon) may insert only rows with a NULL user_id (can't fake a uid).
drop policy if exists "events_insert_anon" on public.events;
create policy "events_insert_anon" on public.events
  for insert to anon
  with check (user_id is null);

-- No SELECT/UPDATE/DELETE policies → RLS default-denies them for anon/authenticated.

-- -----------------------------------------------------------------------------
-- Analytics views — so non-developers (PM) can `select * from <view>` without
-- writing GROUP BY. Views run with the definer's rights, so they read `events`
-- despite the SELECT denial above; query them via service_role / the Supabase
-- console. A future (free, self-hosted) Metabase can point at these directly.
-- -----------------------------------------------------------------------------

-- Daily unique visitors + active (logged-in) users + total event volume.
-- unique_visitors uses properties.anon_id (a per-browser id we attach to every
-- event), so it counts guests too — unlike logged_in_users, which needs user_id.
-- DROP + CREATE (not CREATE OR REPLACE): inserting a column changes existing
-- column positions/names, which CREATE OR REPLACE forbids. Dropping a view is
-- safe (no stored data); the GRANTs below re-apply afterwards.
drop view if exists public.analytics_dau;
create view public.analytics_dau as
  select date_trunc('day', created_at) as day,
         count(distinct properties->>'anon_id')
           filter (where properties ? 'anon_id')                  as unique_visitors,
         count(distinct user_id) filter (where user_id is not null) as logged_in_users,
         count(*) as total_events
  from public.events
  group by 1
  order by 1 desc;

-- Per-event daily counts.
create or replace view public.analytics_event_counts as
  select date_trunc('day', created_at) as day,
         event_name,
         count(*) as cnt
  from public.events
  group by 1, 2
  order by 1 desc, 3 desc;

-- Conversion funnel by day: visit → signup → gap monitor → premium block →
-- subscription page → subscribe click → activation.
create or replace view public.analytics_funnel_daily as
  select date_trunc('day', created_at) as day,
    count(*) filter (where event_name = 'home_viewed')                   as visited,
    count(*) filter (where event_name = 'signup_completed')              as signed_up,
    count(*) filter (where event_name = 'gap_monitor_viewed')            as gap_viewed,
    count(*) filter (where event_name = 'premium_required_modal_viewed') as premium_blocked,
    count(*) filter (where event_name = 'subscription_page_viewed')      as sub_page_viewed,
    count(*) filter (where event_name = 'subscribe_button_clicked')      as subscribe_clicked,
    -- Only the backend's PayPal-webhook confirmation counts as a real
    -- activation; the frontend success-page poll logs an approximate
    -- 'subscription_activated' with source='success_poll', which we exclude here
    -- to avoid double-counting. (Backend webhook inserts source='paypal_webhook'.)
    count(*) filter (
      where event_name = 'subscription_activated'
        and properties->>'source' = 'paypal_webhook'
    ) as activated
  from public.events
  group by 1
  order by 1 desc;

-- -----------------------------------------------------------------------------
-- View grants. The analytics views are read by the backend (admin API). Grant
-- SELECT on them explicitly — a newly created view does not inherit SELECT for
-- service_role, so the backend gets "permission denied for view ..." without
-- this. Only the views are exposed; base-table `events` SELECT stays denied.
-- -----------------------------------------------------------------------------
grant select on public.analytics_dau          to service_role;
grant select on public.analytics_event_counts to service_role;
grant select on public.analytics_funnel_daily to service_role;
