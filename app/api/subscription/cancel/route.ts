import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { backendUrl } from "@/lib/env/backend";

export const dynamic = "force-dynamic";

/** Backend endpoint that cancels the user's PayPal subscription at period end. */
const BACKEND_CANCEL_URL = backendUrl(
  "/api/subscription/cancel",
  process.env.SUBSCRIPTION_CANCEL_URL
);

/**
 * POST /api/subscription/cancel
 *
 * Requires an authenticated session. Proxies to the backend, which cancels the
 * user's PayPal subscription AT PERIOD END (Premium kept until the next billing
 * date → subscription_status='canceling'). The frontend then refreshes auth.
 *
 * Returns the backend's { success, code, message } envelope.
 */
export async function POST() {
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

  if (!BACKEND_CANCEL_URL) {
    console.error("SUBSCRIPTION_CANCEL_URL is not configured.");
    return NextResponse.json(
      { success: false, message: "Cancellation is temporarily unavailable." },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(BACKEND_CANCEL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });

    const data = (await res.json().catch(() => null)) as {
      success?: boolean;
      code?: string;
      message?: string;
    } | null;

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Cancellation failed. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: data.success === true,
        code: data.code ?? null,
        message: data.message ?? "",
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("subscription cancel proxy error:", e);
    return NextResponse.json(
      { success: false, message: "Cancellation failed. Please try again." },
      { status: 502 }
    );
  }
}
