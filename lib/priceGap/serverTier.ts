import { createClient } from "@/lib/supabase/server";
import type { ApiTier } from "@/types/priceGap";

/**
 * Resolve the Price Gap data tier on the SERVER from the session — the single
 * place that decides premium vs basic. The BFF routes attach this to the
 * backend call so the browser cannot forge `?tier=` (frontend-guide §"BFF").
 *
 * Mirrors `useAuth` and the DB is_premium() gate: premium = DB tier 'premium'
 * (the backend promotes a user to 'premium' on Bybit link or Binance approval).
 *
 * Guests (no session) resolve to `basic`: per the guest-access spec they may
 * view 10-min delayed data without logging in. `premium` is therefore only ever
 * attached for a logged-in premium user, which is what the backend relies on
 * (backend회신_PriceGap_비회원지연데이터: t='premium' only → premium, else basic).
 */
export async function resolveServerTier(): Promise<ApiTier> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "basic";

  const { data } = await supabase
    .from("users")
    .select("tier")
    .eq("id", user.id)
    .maybeSingle();

  return data?.tier === "premium" ? "premium" : "basic";
}
