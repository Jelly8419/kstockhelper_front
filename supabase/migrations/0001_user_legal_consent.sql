-- =============================================================================
-- Add legal consent tracking to public.users
-- Captures when a user agreed to the Terms of Service and Privacy Policy, and
-- which version (the document "Last Updated" date) they agreed to.
--
-- Idempotent — safe to re-run. Apply to existing Supabase projects.
-- =============================================================================

alter table public.users add column if not exists terms_agreed_at   timestamptz;
alter table public.users add column if not exists terms_version     text;
alter table public.users add column if not exists privacy_agreed_at timestamptz;
alter table public.users add column if not exists privacy_version   text;

-- Backfill existing users: treat their signup time (created_at) as the consent
-- time, stamped with the current document version. Only fills rows not yet set,
-- so it's safe to re-run.
update public.users
set
  terms_agreed_at   = coalesce(terms_agreed_at, created_at),
  terms_version     = coalesce(terms_version, 'June 8, 2026'),
  privacy_agreed_at = coalesce(privacy_agreed_at, created_at),
  privacy_version   = coalesce(privacy_version, 'June 8, 2026')
where terms_agreed_at is null
   or privacy_agreed_at is null;

-- The existing "users_update_own" RLS policy already allows a user to update
-- their own row (its with-check only pins `tier`), so these consent columns are
-- writable by the authenticated owner. No policy change required.
