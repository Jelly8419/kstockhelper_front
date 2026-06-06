import { NextRequest, NextResponse } from "next/server";
import { getNewsPage } from "@/lib/api/news";
import { NewsFilter } from "@/types/news";

const VALID_FILTERS: NewsFilter[] = ["all", "samsung", "skhynix", "hyundai"];

export const dynamic = "force-dynamic";

/**
 * GET /api/news?filter=<all|samsung|skhynix|hyundai>&page=<n>
 * Returns one page of the news preview feed: { items, hasMore }.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const rawFilter = searchParams.get("filter") ?? "all";
  const filter: NewsFilter = VALID_FILTERS.includes(rawFilter as NewsFilter)
    ? (rawFilter as NewsFilter)
    : "all";

  const page = Math.max(0, Number(searchParams.get("page") ?? "0") || 0);

  const result = await getNewsPage(filter, page);
  return NextResponse.json(result);
}
