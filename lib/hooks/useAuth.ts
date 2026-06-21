"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  BinanceStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  UserTier,
} from "@/types/user";

interface AuthState {
  /** guest (logged out) | free (logged in, tier!='premium') | premium (tier='premium'). */
  tier: UserTier;
  /** Supabase auth user id; null when logged out. Used for analytics user_id. */
  userId: string | null;
  email: string | null;
  bybitUid: string | null;
  binanceUid: string | null;
  binanceStatus: BinanceStatus;
  /** PayPal subscription status (restricted regions); display-only. */
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: SubscriptionPlan | null;
  nextBillingAt: string | null;
  lastPaymentFailed: boolean;
  isLoading: boolean;
}

interface UseAuth extends AuthState {
  /** Re-read session + profile (call after a connect/verify succeeds). */
  refresh: () => Promise<void>;
}

const GUEST: AuthState = {
  tier: "guest",
  userId: null,
  email: null,
  bybitUid: null,
  binanceUid: null,
  binanceStatus: "not_applied",
  subscriptionStatus: "none",
  subscriptionPlan: null,
  nextBillingAt: null,
  lastPaymentFailed: false,
  isLoading: false,
};

/**
 * Real Supabase-backed auth state with 3-tier access.
 * Content access itself is enforced in the DB (news_full view via is_premium());
 * this hook drives the UI. premium = DB tier 'premium' (the backend promotes a
 * user to 'premium' on Bybit link or Binance UID approval — kept in sync with
 * the DB is_premium() gate, which also checks tier='premium' only).
 */
export function useAuth(): UseAuth {
  const [state, setState] = useState<AuthState>({ ...GUEST, isLoading: true });

  const resolve = useCallback(async (session: Session | null) => {
    const supabase = createClient();
    if (!session?.user) return GUEST;

    const email = session.user.email ?? null;
    const { data } = await supabase
      .from("users")
      .select(
        "tier, bybit_uid, binance_uid, binance_uid_status, subscription_status, subscription_plan, subscription_next_billing_at, subscription_last_payment_status"
      )
      .eq("id", session.user.id)
      .maybeSingle();

    const dbTier = data?.tier as "free" | "premium" | undefined;
    const binanceStatus = (data?.binance_uid_status as BinanceStatus) ?? "not_applied";
    // Premium is decided solely by tier: the backend promotes a user to
    // tier='premium' when their Bybit links, their Binance UID is approved, OR
    // their PayPal subscription activates. (binanceStatus / subscription* are
    // still surfaced below for the Settings / Subscription UI.)
    const isPremium = dbTier === "premium";

    const subscriptionStatus =
      (data?.subscription_status as SubscriptionStatus | undefined) ?? "none";

    return {
      tier: (isPremium ? "premium" : "free") as UserTier,
      userId: session.user.id,
      email,
      bybitUid: (data?.bybit_uid as string | null) ?? null,
      binanceUid: (data?.binance_uid as string | null) ?? null,
      binanceStatus,
      subscriptionStatus,
      subscriptionPlan:
        (data?.subscription_plan as SubscriptionPlan | null) ?? null,
      nextBillingAt:
        (data?.subscription_next_billing_at as string | null) ?? null,
      lastPaymentFailed: subscriptionStatus === "past_due",
      isLoading: false,
    };
  }, []);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    setState(await resolve(data.session));
  }, [resolve]);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    const apply = async (session: Session | null) => {
      const next = await resolve(session);
      if (active) setState(next);
    };

    supabase.auth.getSession().then(({ data }) => apply(data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      apply(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [resolve]);

  return { ...state, refresh };
}
