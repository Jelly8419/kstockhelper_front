"use client";

import { useEffect, useState } from "react";
import { UserTier } from "@/types/user";

interface AuthState {
  tier: UserTier;
  email: string | null;
  isLoading: boolean;
}

/**
 * Returns the current user's access tier.
 *
 * For now this is a mock that defaults to "guest". The UI gating
 * (signup gate / premium gate) is driven entirely by this value, so it can
 * be toggled during development.
 *
 * TODO (backend): read the Supabase session + the user's subscription tier
 * and return "guest" | "free" | "premium" accordingly.
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    tier: "guest",
    email: null,
    isLoading: true,
  });

  useEffect(() => {
    // TODO: replace with Supabase session + tier lookup.
    setState({ tier: "guest", email: null, isLoading: false });
  }, []);

  return state;
}
