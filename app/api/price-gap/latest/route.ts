import { NextResponse } from "next/server";
import { resolveServerTier } from "@/lib/priceGap/serverTier";
import { mockPriceGapLatest } from "@/lib/api/priceGap.mock";

export const dynamic = "force-dynamic";

/** Backend base, e.g. https://host/api/price-gap (server-only, no NEXT_PUBLIC). */
const BASE = process.env.PRICE_GAP_API_BASE ?? "";

/**
 * BFF for the Price Gap latest snapshot (frontend-guide §"BFF").
 *
 * The browser never calls the backend directly: the tier is decided HERE from
 * the session so it can't be forged via `?tier=`. Guests are refused. When
 * PRICE_GAP_API_BASE is unset, the in-repo mock is served so the UI works
 * before the backend is wired.
 */
export async function GET() {
  const tier = await resolveServerTier();
  if (!tier) {
    return NextResponse.json(
      { success: false, code: "PRICE_GAP_UNAUTHENTICATED", message: "Login required." },
      { status: 401 }
    );
  }

  if (!BASE) {
    return NextResponse.json({
      success: true,
      code: "PRICE_GAP_LATEST",
      data: mockPriceGapLatest(tier),
    });
  }

  try {
    const r = await fetch(`${BASE}/latest?tier=${tier}`, { cache: "no-store" });
    const json = await r.json();
    return NextResponse.json(json, { status: r.status });
  } catch {
    return NextResponse.json(
      { success: false, code: "PRICE_GAP_ERROR", message: "Upstream error." },
      { status: 502 }
    );
  }
}
