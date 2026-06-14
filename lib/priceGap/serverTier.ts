import { createClient } from "@/lib/supabase/server";
import type { ApiTier } from "@/types/priceGap";

/**
 * Resolve the Price Gap data tier on the SERVER from the session — the single
 * place that decides premium vs basic. The BFF routes attach this to the
 * backend call so the browser cannot forge `?tier=` (frontend-guide §"BFF").
 *
 * Mirrors `useAuth`: premium = DB tier 'premium' (Bybit) OR Binance approved.
 * Returns `null` for guests (no session) so the route can refuse the call.
 */
export async function resolveServerTier(): Promise<ApiTier | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("tier, binance_uid_status")
    .eq("id", user.id)
    .maybeSingle();

  const isPremium =
    data?.tier === "premium" || data?.binance_uid_status === "approved";
  return isPremium ? "premium" : "basic";
}
