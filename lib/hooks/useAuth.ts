"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { RawTier, UserTier } from "@/types/user";

interface AuthState {
  /** Simplified access tier: "member" when logged in, else "guest". */
  tier: UserTier;
  email: string | null;
  /** DB tier (free/premium), for future premium gating. Null until loaded. */
  rawTier: RawTier | null;
  isLoading: boolean;
}

const GUEST: AuthState = {
  tier: "guest",
  email: null,
  rawTier: null,
  isLoading: false,
};

/**
 * Real Supabase-backed auth state.
 * - Logged in  → tier "member"
 * - Logged out → tier "guest"
 * Reacts to login/logout in real time via onAuthStateChange.
 *
 * Note: actual content access is enforced in the DB (news_full view via
 * is_premium()). This hook only drives the UI.
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ ...GUEST, isLoading: true });

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    // Read the DB tier for a logged-in user (best-effort; UI doesn't block on it).
    const loadRawTier = async (userId: string): Promise<RawTier | null> => {
      const { data, error } = await supabase
        .from("users")
        .select("tier")
        .eq("id", userId)
        .maybeSingle();
      if (error || !data) return null;
      return (data.tier as RawTier) ?? null;
    };

    const apply = async (session: Session | null) => {
      if (!session?.user) {
        if (active) setState(GUEST);
        return;
      }
      const email = session.user.email ?? null;
      // Show member access immediately; enrich with rawTier when it resolves.
      if (active) {
        setState({ tier: "member", email, rawTier: null, isLoading: false });
      }
      const rawTier = await loadRawTier(session.user.id);
      if (active) {
        setState({ tier: "member", email, rawTier, isLoading: false });
      }
    };

    // Initial session.
    supabase.auth.getSession().then(({ data }) => apply(data.session));

    // Live updates on login / logout / token refresh.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      apply(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
