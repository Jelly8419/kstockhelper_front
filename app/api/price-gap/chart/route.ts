import { NextRequest, NextResponse } from "next/server";
import { resolveServerTier } from "@/lib/priceGap/serverTier";
import { mockPriceGapChart } from "@/lib/api/priceGap.mock";
import { PRICE_GAP_STOCK_ORDER } from "@/types/priceGap";
import type { Exchange, StockCode } from "@/types/priceGap";

export const dynamic = "force-dynamic";

const BASE = process.env.PRICE_GAP_API_BASE ?? "";
const EXCHANGES: Exchange[] = ["binance", "bybit"];

/**
 * BFF for the Price Gap 1-minute OHLC chart (one stock × one exchange).
 * `exchange`/`stock` come from the client; `tier` is decided server-side from
 * the session (same anti-forgery rationale as /latest). Falls back to mock when
 * PRICE_GAP_API_BASE is unset.
 */
export async function GET(req: NextRequest) {
  const tier = await resolveServerTier();
  if (!tier) {
    return NextResponse.json(
      { success: false, code: "PRICE_GAP_UNAUTHENTICATED", message: "Login required." },
      { status: 401 }
    );
  }

  const exchange = req.nextUrl.searchParams.get("exchange") as Exchange | null;
  const stock = req.nextUrl.searchParams.get("stock") as StockCode | null;

  if (!exchange || !EXCHANGES.includes(exchange)) {
    return NextResponse.json(
      { success: false, code: "PRICE_GAP_INVALID_EXCHANGE", message: "Invalid exchange." },
      { status: 400 }
    );
  }
  if (!stock || !PRICE_GAP_STOCK_ORDER.includes(stock)) {
    return NextResponse.json(
      { success: false, code: "PRICE_GAP_INVALID_STOCK", message: "Invalid stock." },
      { status: 400 }
    );
  }

  if (!BASE) {
    return NextResponse.json({
      success: true,
      code: "PRICE_GAP_CHART",
      data: mockPriceGapChart(exchange, stock, tier),
    });
  }

  try {
    const r = await fetch(
      `${BASE}/chart?exchange=${exchange}&stock=${stock}&tier=${tier}`,
      { cache: "no-store" }
    );
    const json = await r.json();
    return NextResponse.json(json, { status: r.status });
  } catch {
    return NextResponse.json(
      { success: false, code: "PRICE_GAP_ERROR", message: "Upstream error." },
      { status: 502 }
    );
  }
}
