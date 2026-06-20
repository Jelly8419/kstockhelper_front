import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { backendUrl } from "@/lib/env/backend";

export const dynamic = "force-dynamic";

/** Backend endpoint that creates a PayPal subscription and returns its approval URL. */
const BACKEND_CREATE_URL = backendUrl(
  "/api/subscription/create",
  process.env.SUBSCRIPTION_CREATE_URL
);

/**
 * POST /api/subscription/create
 *
 * Requires an authenticated session. Proxies to the backend, which creates a
 * PayPal subscription for the user and returns a PayPal `approvalUrl` for the
 * browser to redirect to. Activation itself is webhook-driven on the backend —
 * the frontend never trusts a client-side callback (see backend request doc §3).
 *
 * Returns the backend's { success, code, message, approvalUrl } envelope. The
 * frontend maps `code` → i18n key; `message` is a fallback only.
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

  if (!BACKEND_CREATE_URL) {
    console.error("SUBSCRIPTION_CREATE_URL is not configured.");
    return NextResponse.json(
      { success: false, message: "Subscription is temporarily unavailable." },
      { status: 503 }
    );
  }

  try {
    // Forward the trusted session userId. The backend re-validates the region
    // (the client cookie is non-httpOnly / tamperable — see backend doc §5).
    const res = await fetch(BACKEND_CREATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });

    const data = (await res.json().catch(() => null)) as {
      success?: boolean;
      code?: string;
      message?: string;
      approvalUrl?: string;
    } | null;

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Subscription failed. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: data.success === true,
        code: data.code ?? null,
        message: data.message ?? "",
        approvalUrl: data.approvalUrl ?? null,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("subscription create proxy error:", e);
    return NextResponse.json(
      { success: false, message: "Subscription failed. Please try again." },
      { status: 502 }
    );
  }
}
