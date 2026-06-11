import { NextRequest, NextResponse } from "next/server";
import { getNewsPage } from "@/lib/api/news";
import { NewsFilter, NewsCategory } from "@/types/news";
import { getServerContentLocale } from "@/lib/i18n/getServerLocale";

const VALID_FILTERS: NewsFilter[] = ["all", "samsung", "skhynix", "hyundai"];
const VALID_CATEGORIES: NewsCategory[] = ["news", "disclosure"];

export const dynamic = "force-dynamic";

/**
 * GET /api/news?filter=<all|samsung|skhynix|hyundai>&category=<news|disclosure>&page=<n>
 * Returns one page of the news preview feed: { items, hasMore, total }.
 * `category` is optional — omit to include both news and disclosures.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const rawFilter = searchParams.get("filter") ?? "all";
  const filter: NewsFilter = VALID_FILTERS.includes(rawFilter as NewsFilter)
    ? (rawFilter as NewsFilter)
    : "all";

  const rawCategory = searchParams.get("category");
  const category: NewsCategory | undefined = VALID_CATEGORIES.includes(
    rawCategory as NewsCategory
  )
    ? (rawCategory as NewsCategory)
    : undefined;

  const page = Math.max(0, Number(searchParams.get("page") ?? "0") || 0);

  // Content locale comes from the x-locale header (set by middleware), not the
  // client — keeps the list in the same language as the SSR'd first page.
  const contentLocale = getServerContentLocale();

  const result = await getNewsPage(filter, page, undefined, category, contentLocale);
  return NextResponse.json(result);
}
