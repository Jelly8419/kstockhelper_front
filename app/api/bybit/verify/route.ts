import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Backend endpoint that verifies a Bybit UID and upgrades the user to premium. */
const BACKEND_VERIFY_URL = process.env.BYBIT_VERIFY_URL;

/**
 * POST /api/bybit/verify  { bybitUid: string }
 *
 * Requires an authenticated session. Proxies the request to the backend, which
 * verifies the UID against the Bybit affiliate API and (on success) sets the
 * user's tier to 'premium'. The frontend then refreshes its auth state.
 */
export async function POST(request: NextRequest) {
  // Require a logged-in user.
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

  let body: { bybitUid?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  const bybitUid = typeof body.bybitUid === "string" ? body.bybitUid.trim() : "";
  if (!bybitUid) {
    return NextResponse.json(
      { success: false, message: "Bybit UID is required." },
      { status: 400 }
    );
  }

  if (!BACKEND_VERIFY_URL) {
    console.error("BYBIT_VERIFY_URL is not configured.");
    return NextResponse.json(
      { success: false, message: "Verification is temporarily unavailable." },
      { status: 503 }
    );
  }

  try {
    // Forward to the backend with the user's id (from the trusted session) + UID.
    // Backend always responds { success: boolean, message: string }.
    const res = await fetch(BACKEND_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, bybitUid }),
    });

    const data = (await res.json().catch(() => null)) as {
      success?: boolean;
      message?: string;
    } | null;

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Verification failed. Please try again." },
        { status: 502 }
      );
    }

    // Pass the backend's { success, message } through verbatim (message may be Korean).
    return NextResponse.json(
      { success: data.success === true, message: data.message ?? "" },
      { status: 200 }
    );
  } catch (e) {
    console.error("bybit verify proxy error:", e);
    return NextResponse.json(
      { success: false, message: "Verification failed. Please try again." },
      { status: 502 }
    );
  }
}
