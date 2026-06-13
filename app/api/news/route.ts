import { NextRequest, NextResponse } from "next/server";
import { getNewsPage } from "@/lib/api/news";
import { NewsCategory, TickerLabel } from "@/types/news";
import { resolveContentLocale } from "@/lib/i18n/normalize";

const VALID_TICKERS: TickerLabel[] = ["samsung", "skhynix", "hyundai"];
const VALID_CATEGORIES: NewsCategory[] = ["news", "disclosure"];

export const dynamic = "force-dynamic";

/**
 * GET /api/news?tickers=<csv>&category=<news|disclosure>&page=<n>&locale=<uiLocale>
 * Returns one page of the news preview feed: { items, hasMore, total }.
 *
 * - `tickers`: comma-separated company ids (multi-select, OR match). Omit or
 *   pass empty for no company filter ("All"). Unknown ids are dropped.
 * - `category`: optional — omit (or "all") to include both news and disclosures.
 *
 * `locale` is the UI locale (from the URL prefix) the client passes so the list
 * stays in the same language as the SSR'd first page. It's mapped to a content
 * locale (whitelist → translate, else English source).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Parse + whitelist tickers; drop blanks and unknown ids. Dedupe.
  const rawTickers = (searchParams.get("tickers") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter((t): t is TickerLabel => VALID_TICKERS.includes(t as TickerLabel));
  const tickers = Array.from(new Set(rawTickers));

  const rawCategory = searchParams.get("category");
  const category: NewsCategory | undefined = VALID_CATEGORIES.includes(
    rawCategory as NewsCategory
  )
    ? (rawCategory as NewsCategory)
    : undefined;

  const page = Math.max(0, Number(searchParams.get("page") ?? "0") || 0);

  const contentLocale = resolveContentLocale(searchParams.get("locale"));

  const result = await getNewsPage(tickers, page, undefined, category, contentLocale);
  return NextResponse.json(result);
}
