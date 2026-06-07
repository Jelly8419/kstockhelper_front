"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { UserTier } from "@/types/user";

interface AuthState {
  /** guest (logged out) | free (logged in, no Bybit) | premium (Bybit connected). */
  tier: UserTier;
  email: string | null;
  bybitUid: string | null;
  isLoading: boolean;
}

interface UseAuth extends AuthState {
  /** Re-read session + profile (call after Bybit verify succeeds). */
  refresh: () => Promise<void>;
}

const GUEST: AuthState = {
  tier: "guest",
  email: null,
  bybitUid: null,
  isLoading: false,
};

/**
 * Real Supabase-backed auth state with 3-tier access.
 * Content access itself is enforced in the DB (news_full view via is_premium());
 * this hook drives the UI.
 */
export function useAuth(): UseAuth {
  const [state, setState] = useState<AuthState>({ ...GUEST, isLoading: true });

  const resolve = useCallback(async (session: Session | null) => {
    const supabase = createClient();
    if (!session?.user) return GUEST;

    const email = session.user.email ?? null;
    const { data } = await supabase
      .from("users")
      .select("tier, bybit_uid")
      .eq("id", session.user.id)
      .maybeSingle();

    const dbTier = data?.tier as "free" | "premium" | undefined;
    return {
      tier: (dbTier === "premium" ? "premium" : "free") as UserTier,
      email,
      bybitUid: (data?.bybit_uid as string | null) ?? null,
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
