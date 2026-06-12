-- =============================================================================
-- Premium waitlist for restricted-region users.
--
-- Restricted regions (regulatory) can't access exchange-linked Premium. When a
-- logged-in user there taps "Join Waitlist", we capture their interest here so a
-- future content-only tier / expanded country support can reach them (PRD §8,10).
--
-- One row per user (unique user_id) so repeat clicks don't duplicate. Inserts go
-- through the authenticated client, so RLS allows a user to add only their own
-- row.
--
-- Idempotent — safe to re-run.
-- =============================================================================

create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  email      text,
  created_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.waitlist enable row level security;

-- A user may insert only their own waitlist row.
drop policy if exists "waitlist_insert_own" on public.waitlist;
create policy "waitlist_insert_own" on public.waitlist
  for insert
  with check (auth.uid() = user_id);

-- A user may read their own waitlist row (e.g. to detect existing membership).
drop policy if exists "waitlist_select_own" on public.waitlist;
create policy "waitlist_select_own" on public.waitlist
  for select
  using (auth.uid() = user_id);
