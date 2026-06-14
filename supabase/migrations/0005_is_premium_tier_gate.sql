-- =============================================================================
-- Tighten is_premium() to actual premium tier (not just "logged in").
--
-- Until now is_premium() returned `auth.uid() is not null` — ANY logged-in user
-- passed, so free-tier users received the full gated content (summary / body /
-- key_points / key_figures) in news_full and news_translations_full. The UI hid
-- it behind a lock (useAuth treats them as "free"), but the data was already on
-- the wire — readable via DevTools or a direct PostgREST call. The real gate is
-- the DB, and the DB wasn't gating free users.
--
-- New rule: premium ⇔ users.tier = 'premium'. (Bybit-linked users are promoted
-- to tier='premium' by the backend, so the tier check covers them.)
--
-- security definer + set search_path: the function reads public.users under its
-- owner's rights, bypassing the users RLS (which otherwise limits a caller to
-- their own row — fine here since we only ever check auth.uid()'s own row).
--
-- Only the function changes. The views (news_full, news_translations_full,
-- news_preview) call is_premium() and pick up the new behavior automatically —
-- they are intentionally NOT redefined here.
--
-- Idempotent — safe to re-run.
-- =============================================================================

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
