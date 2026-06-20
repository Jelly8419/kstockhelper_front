-- =============================================================================
-- PayPal subscription columns (restricted-region Premium path).
--
-- Restricted-country users (exchange referral unavailable) now obtain Premium
-- via a PayPal subscription instead of UID linking. Premium gating itself stays
-- driven by users.tier='premium' (is_premium() unchanged) — the backend keeps
-- tier in sync with the subscription state below. These columns are surfaced
-- read-only by the frontend (status badge / next billing date / cancel button /
-- payment-failed notice) — see lib/hooks/useAuth.ts.
--
-- status ↔ tier invariants (maintained by the backend / PayPal webhook):
--   active    → tier='premium'   (subscribed, renewing)
--   canceling → tier='premium'   (cancelled, kept until subscription_next_billing_at)
--   past_due  → tier='free'      (payment failed → immediate Basic, no grace)
--   none      → tier='free'      (no subscription / ended)
--
-- This is the FRONTEND repo's mirror of the backend migration
-- (0012_paypal_subscription.sql). The backend owns the authoritative schema,
-- the RPC (apply_subscription_event), and the webhook; here we only add the
-- columns the frontend reads + RLS read access. Kept in sync per the backend
-- request doc (백엔드요청_구독결제_PayPal.md §1).
--
-- Idempotent — safe to re-run.
-- =============================================================================

-- Subscription status enum (mirrors SubscriptionStatus in types/user.ts).
do $$
begin
  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type public.subscription_status as enum
      ('none', 'active', 'canceling', 'past_due');
  end if;
  if not exists (select 1 from pg_type where typname = 'subscription_plan') then
    create type public.subscription_plan as enum ('trial', 'regular');
  end if;
end$$;

-- Subscription columns on users (idempotent backfill).
alter table public.users
  add column if not exists subscription_status public.subscription_status
    not null default 'none';
alter table public.users
  add column if not exists subscription_next_billing_at timestamptz;
alter table public.users
  add column if not exists subscription_plan public.subscription_plan;
alter table public.users
  add column if not exists subscription_last_payment_status text;
alter table public.users
  add column if not exists paypal_subscription_id text;

-- The existing users RLS already lets a user read their own row (and blocks
-- tier self-escalation). The subscription columns are read through that same
-- own-row SELECT policy; users never write them (the backend / webhook does via
-- service_role). No new policy needed — documented here for clarity.
