import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { backendUrl } from "@/lib/env/backend";

export const dynamic = "force-dynamic";

/** Optional backend endpoint returning the user's canonical subscription state. */
const BACKEND_STATUS_URL = backendUrl(
  "/api/subscription/status",
  process.env.SUBSCRIPTION_STATUS_URL
);

/**
 * GET /api/subscription/status
 *
 * Optional. The frontend reads subscription state directly from the Supabase
 * `users` row via useAuth (no extra round-trip), so this route is only used if
 * the backend prefers a canonical status endpoint. When SUBSCRIPTION_STATUS_URL
 * is unset it returns 503 so callers fall back to the useAuth read.
 *
 * Returns the backend's { success, status, plan, nextBillingDate,
 * lastPaymentStatus } shape.
 */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Not authenticated." },
      { status: 401 }
    );
  }

  if (!BACKEND_STATUS_URL) {
    return NextResponse.json(
      { success: false, message: "Status endpoint is not configured." },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(
      `${BACKEND_STATUS_URL}?userId=${encodeURIComponent(user.id)}`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );

    const data = (await res.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Could not load subscription status." },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error("subscription status proxy error:", e);
    return NextResponse.json(
      { success: false, message: "Could not load subscription status." },
      { status: 502 }
    );
  }
}
