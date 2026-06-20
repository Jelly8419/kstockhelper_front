import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { backendUrl } from "@/lib/env/backend";

export const dynamic = "force-dynamic";

/** Backend endpoint that stores a Binance UID and sets status to 'pending'. */
const BACKEND_CONNECT_URL = backendUrl(
  "/api/binance/connect",
  process.env.BINANCE_CONNECT_URL
);

/**
 * POST /api/binance/connect  { binanceUid: string }
 *
 * Requires an authenticated session. Proxies to the backend, which stores the
 * UID and sets binance_uid_status = 'pending' (manual approval follows).
 */
export async function POST(request: NextRequest) {
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

  let body: { binanceUid?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  const binanceUid =
    typeof body.binanceUid === "string" ? body.binanceUid.trim() : "";
  if (!binanceUid) {
    return NextResponse.json(
      { success: false, message: "Binance UID is required." },
      { status: 400 }
    );
  }

  if (!BACKEND_CONNECT_URL) {
    console.error("BINANCE_CONNECT_URL is not configured.");
    return NextResponse.json(
      { success: false, message: "Connection is temporarily unavailable." },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(BACKEND_CONNECT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, binanceUid }),
    });

    const data = (await res.json().catch(() => null)) as {
      success?: boolean;
      code?: string;
      message?: string;
    } | null;

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Connection failed. Please try again." },
        { status: 502 }
      );
    }

    // Pass { success, code, message } through. The frontend maps `code` → i18n
    // key (the source of truth); `message` is a fallback only.
    return NextResponse.json(
      {
        success: data.success === true,
        code: data.code ?? null,
        message: data.message ?? "",
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("binance connect proxy error:", e);
    return NextResponse.json(
      { success: false, message: "Connection failed. Please try again." },
      { status: 502 }
    );
  }
}
