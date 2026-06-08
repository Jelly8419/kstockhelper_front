-- =============================================================================
-- Ensure every auth user has a public.users profile row.
--
-- Symptom this fixes: OAuth (Google) sign-ups appeared in auth.users but not in
-- public.users, because the on_auth_user_created trigger was missing/failing on
-- the live DB. We (1) re-create the trigger function defensively, (2) re-attach
-- the trigger, and (3) backfill any auth users that don't yet have a profile.
--
-- Idempotent — safe to re-run.
-- =============================================================================

-- (1) Profile-creation function. SECURITY DEFINER so it bypasses RLS/grants
-- (authenticated has no INSERT on public.users by design). Exception-safe so a
-- profile hiccup never blocks the auth signup itself.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, tier)
  values (new.id, coalesce(new.email, ''), 'free')
  on conflict (id) do nothing;
  return new;
exception
  when others then
    -- Never fail the auth.users insert because of a profile issue.
    raise warning 'handle_new_user failed for %: %', new.id, sqlerrm;
    return new;
end;
$$;

-- (2) (Re)attach the trigger to auth.users.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- (3) Backfill profiles for any existing auth users missing one (e.g. the
-- Google account already created before this fix).
insert into public.users (id, email, tier)
select au.id, coalesce(au.email, ''), 'free'
from auth.users au
left join public.users pu on pu.id = au.id
where pu.id is null
on conflict (id) do nothing;
