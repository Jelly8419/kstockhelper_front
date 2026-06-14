-- =============================================================================
-- K-Stock Helper — full schema migration
-- Apply to a fresh Supabase project's SQL Editor to reproduce the current
-- public schema (tables, enums, functions, triggers, views, RLS, grants, seed).
--
-- Reconstructed from the live dev DB metadata. Idempotent where practical.
-- Run top-to-bottom in a single execution.
--
-- Notes:
--   * Depends on Supabase's built-in auth schema (auth.users, auth.uid()).
--   * public.users.tier is gated to "logged-in = access" via is_premium()
--     (see function body) — matches current behavior.
-- =============================================================================

create extension if not exists "uuid-ossp";


-- =============================================================================
-- ENUMS
-- =============================================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_tier') then
    create type public.user_tier as enum ('guest', 'free', 'premium');
  end if;
  if not exists (select 1 from pg_type where typname = 'news_category') then
    create type public.news_category as enum ('disclosure', 'news');
  end if;
end$$;


-- =============================================================================
-- TABLES
-- =============================================================================

-- users (profile, 1:1 with auth.users) ----------------------------------------
create table if not exists public.users (
  id                 uuid primary key references auth.users (id) on delete cascade,
  email              text not null,
  tier               public.user_tier not null default 'free',
  ibkr_linked_at     timestamptz,
  -- Legal consent (captured at signup; version = document "Last Updated" date).
  terms_agreed_at    timestamptz,
  terms_version      text,
  privacy_agreed_at  timestamptz,
  privacy_version    text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Backfill columns for existing deployments (idempotent).
alter table public.users add column if not exists terms_agreed_at   timestamptz;
alter table public.users add column if not exists terms_version     text;
alter table public.users add column if not exists privacy_agreed_at timestamptz;
alter table public.users add column if not exists privacy_version   text;

-- stocks (ticker master) ------------------------------------------------------
create table if not exists public.stocks (
  id          text primary key,
  name        text not null,
  ticker_code text,
  created_at  timestamptz not null default now()
);

-- news (disclosures + news, unified) ------------------------------------------
-- NOTE: category/preview/body/summary/key_points are nullable (backend relaxed
-- NOT NULL so that "collected" rows without translation can be stored).
create table if not exists public.news (
  id                   uuid primary key default uuid_generate_v4(),
  category             public.news_category,
  title                text not null,
  preview              text,
  body                 text,
  summary              text,
  key_points           text[],
  source               text,
  source_url           text,
  external_id          text,
  published_at         timestamptz not null default now(),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  translated_title     text,
  english_translation  text,
  key_figures          jsonb,
  related_stocks       jsonb,
  confidence           integer,
  canonical_url        text,
  status               text default 'collected',
  stock_code           text,
  url                  text,
  is_premium           boolean default false,
  subcategory          text,
  constraint news_key_points_len check (array_length(key_points, 1) = 3),
  constraint news_source_external_unique unique (source, external_id)
);

create index if not exists news_published_at_idx on public.news (published_at desc);
create index if not exists news_category_idx on public.news (category);

-- news_stocks (many-to-many: news <-> stocks) ---------------------------------
create table if not exists public.news_stocks (
  news_id   uuid not null references public.news (id) on delete cascade,
  stock_id  text not null references public.stocks (id) on delete cascade,
  primary key (news_id, stock_id)
);

create index if not exists news_stocks_stock_id_idx on public.news_stocks (stock_id);
create index if not exists news_stocks_news_id_idx on public.news_stocks (news_id);

-- market_data (ticker board) --------------------------------------------------
create table if not exists public.market_data (
  symbol         text primary key,
  name           text,
  type           text,
  price          numeric,
  change         numeric,
  change_percent numeric,
  updated_at     timestamptz default now()
);

-- processing_logs (backend pipeline log) --------------------------------------
create table if not exists public.processing_logs (
  id           bigint generated by default as identity primary key,
  source       text,
  external_id  text,
  stage        text,
  status       text not null,
  reason       text,
  meta         jsonb,
  created_at   timestamptz default now()
);


-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- updated_at maintenance.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Auto-create a profile row on auth signup (defaults to free tier).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, tier)
  values (new.id, new.email, 'free')
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Content access gate: premium tier only (NOT merely "logged in").
-- premium ⇔ users.tier = 'premium' (Bybit-linked users are promoted there by
-- the backend). See migrations/0005_is_premium_tier_gate.sql.
create or replace function public.is_premium()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.tier = 'premium'
  );
$$;


-- =============================================================================
-- TRIGGERS
-- =============================================================================

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists news_set_updated_at on public.news;
create trigger news_set_updated_at
  before update on public.news
  for each row execute function public.set_updated_at();

-- Profile auto-creation on new auth user.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table public.users           enable row level security;
alter table public.stocks          enable row level security;
alter table public.news            enable row level security;
alter table public.news_stocks     enable row level security;
alter table public.market_data     enable row level security;
alter table public.processing_logs enable row level security;

-- users: read/update own row only; no tier self-escalation.
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and tier = (select u.tier from public.users u where u.id = auth.uid())
  );

-- stocks: public read.
drop policy if exists "stocks_select_all" on public.stocks;
create policy "stocks_select_all"
  on public.stocks for select using (true);

-- news: public read (preview fields). Full content gated via news_full view.
drop policy if exists "news_select_all" on public.news;
create policy "news_select_all"
  on public.news for select using (true);

-- news_stocks: public read.
drop policy if exists "news_stocks_select_all" on public.news_stocks;
create policy "news_stocks_select_all"
  on public.news_stocks for select using (true);

-- market_data: public read.
drop policy if exists "market_data_select_all" on public.market_data;
create policy "market_data_select_all"
  on public.market_data for select using (true);

-- processing_logs: no public policy (service_role only via grants).


-- =============================================================================
-- GRANTS
-- =============================================================================
grant usage on schema public to anon, authenticated;

-- Read access (RLS narrows rows; writes are service_role only).
grant select on public.stocks       to anon, authenticated;
grant select on public.news         to anon, authenticated;
grant select on public.news_stocks  to anon, authenticated;
grant select on public.market_data  to anon, authenticated;
grant select on public.users        to authenticated;
grant update on public.users        to authenticated;

-- Backend pipeline (service_role) — full DML on content tables.
grant select, insert, update, delete on public.news            to service_role;
grant select, insert, update, delete on public.news_stocks     to service_role;
grant select, insert, update, delete on public.market_data     to service_role;
grant select, insert, update, delete on public.stocks          to service_role;
grant select, insert, update, delete on public.processing_logs to service_role;
grant select, insert, update, delete on public.users           to service_role;
grant usage, select on all sequences in schema public to service_role;


-- =============================================================================
-- VIEWS (frontend-facing; created after base tables + is_premium())
-- =============================================================================

-- Public preview (published-only, English title, no premium body).
drop view if exists public.news_preview;
create view public.news_preview as
select
  n.id,
  n.category,
  n.subcategory,
  coalesce(n.translated_title, n.title) as title,
  left(coalesce(n.summary, ''::text), 280) as preview,
  n.source,
  n.url,
  n.is_premium,
  n.published_at,
  coalesce(
    array_agg(ns.stock_id) filter (where ns.stock_id is not null),
    '{}'::text[]
  ) as stock_ids
from public.news n
left join public.news_stocks ns on ns.news_id = n.id
where n.status = 'published'::text
group by n.id;

-- Detail view with premium gating (full fields NULL for non-members).
drop view if exists public.news_full;
create view public.news_full as
select
  n.id,
  n.category,
  n.subcategory,
  coalesce(n.translated_title, n.title) as title,
  left(coalesce(n.summary, ''::text), 280) as preview,
  n.source,
  n.url,
  n.is_premium,
  n.published_at,
  case when public.is_premium() then n.english_translation else null::text end as body,
  case when public.is_premium() then n.summary             else null::text end as summary,
  case when public.is_premium() then n.key_points          else null::text[] end as key_points,
  case when public.is_premium() then n.key_figures         else null::jsonb end as key_figures,
  coalesce(
    array_agg(ns.stock_id) filter (where ns.stock_id is not null),
    '{}'::text[]
  ) as stock_ids
from public.news n
left join public.news_stocks ns on ns.news_id = n.id
where n.status = 'published'::text
group by n.id;

grant select on public.news_preview to anon, authenticated;
grant select on public.news_full    to anon, authenticated;


-- =============================================================================
-- SEED — ticker master (idempotent)
-- =============================================================================
insert into public.stocks (id, name, ticker_code) values
  ('samsung', 'Samsung Electronics', '005930'),
  ('skhynix', 'SK hynix',            '000660'),
  ('hyundai', 'Hyundai Motor',       '005380')
on conflict (id) do nothing;
