import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { backendUrl } from "@/lib/env/backend";
import { getCountryCode } from "@/lib/geo/country";

export const dynamic = "force-dynamic";

/** Backend endpoint that persists a real-estate buying-support request. */
const BACKEND_REQUESTS_URL = backendUrl("/api/real-estate/requests");

/**
 * POST /api/real-estate/requests
 *
 * Thin BFF for the Real Estate buying-support form. The browser cannot reach the
 * backend directly (BACKEND_API_BASE is server-only), and we deliberately keep
 * the Supabase service_role OUT of the frontend — so this route just:
 *   1) reads the (optional) session userId server-side — the form never sends it,
 *   2) forwards the IP-derived country code (the backend's socket IP would be this
 *      Vercel host, not the user's — same forwarding model as subscription/create),
 *   3) proxies the body to the backend, which validates, rate-limits, and inserts
 *      via service_role, returning a { success, code, message } envelope.
 *
 * No auth required (PRD: submit without signup). Guests submit with userId=null.
 */
export async function POST(request: NextRequest) {
  // Optional session — used only to tag the lead with a real user id (never trusted
  // from the client body). Absent for guests, which is allowed.
  let userId: string | null = null;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    userId = null;
  }

  if (!BACKEND_REQUESTS_URL) {
    console.error("BACKEND_API_BASE is not configured for real-estate requests.");
    return NextResponse.json(
      { success: false, code: "REAL_ESTATE_REQUEST_UNAVAILABLE", message: "" },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { success: false, code: "REAL_ESTATE_REQUEST_INVALID", message: "" },
      { status: 200 }
    );
  }

  try {
    const res = await fetch(BACKEND_REQUESTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Forward the form fields plus server-derived userId + country code.
      body: JSON.stringify({
        ...body,
        userId,
        countryCode: getCountryCode(request) ?? null,
      }),
    });

    const data = (await res.json().catch(() => null)) as {
      success?: boolean;
      code?: string;
      message?: string;
    } | null;

    if (!data) {
      return NextResponse.json(
        { success: false, code: "REAL_ESTATE_REQUEST_ERROR", message: "" },
        { status: 502 }
      );
    }

    // Mirror the backend's status (e.g. 429 for rate limit) and envelope.
    return NextResponse.json(
      {
        success: data.success === true,
        code: data.code ?? null,
        message: data.message ?? "",
      },
      { status: res.status }
    );
  } catch (e) {
    console.error("real-estate request proxy error:", e);
    return NextResponse.json(
      { success: false, code: "REAL_ESTATE_REQUEST_ERROR", message: "" },
      { status: 502 }
    );
  }
}
