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

  const url = `${BASE}/latest?tier=${tier}`;
  try {
    const r = await fetch(url, { cache: "no-store" });
    const text = await r.text();
    try {
      return NextResponse.json(JSON.parse(text), { status: r.status });
    } catch {
      // Upstream replied non-JSON (HTML error page, empty body, proxy error…).
      console.error(
        `[price-gap/latest] non-JSON upstream ${r.status} from ${url}: ${text.slice(0, 300)}`
      );
      return NextResponse.json(
        { success: false, code: "PRICE_GAP_ERROR", message: "Upstream error." },
        { status: 502 }
      );
    }
  } catch (err) {
    // Network-level failure: DNS, connection refused, timeout…
    console.error(`[price-gap/latest] fetch failed for ${url}:`, err);
    return NextResponse.json(
      { success: false, code: "PRICE_GAP_ERROR", message: "Upstream error." },
      { status: 502 }
    );
  }
}
