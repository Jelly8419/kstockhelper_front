import { headers } from "next/headers";
import { MarketTicker } from "@/components/market/MarketTicker";
import { SignupBanner } from "@/components/banner/SignupBanner";
import { NewsList } from "@/components/news/NewsList";
import { HotInKoreaCarousel } from "@/components/hotNews/HotInKoreaCarousel";
import { getNewsPage } from "@/lib/api/news";
import { getHotNewsList } from "@/lib/api/hotNews";
import { NewsCategory } from "@/types/news";
import { SHOW_BANNER_HEADER } from "@/lib/geo/bannerGate";
import { resolveContentLocale } from "@/lib/i18n/normalize";

// Real-time content — always fetch fresh.
export const dynamic = "force-dynamic";

// Default content type shown on first load.
const INITIAL_CATEGORY: NewsCategory = "news";

export default async function Home({
  params,
}: {
  params: { locale: string };
}) {
  // Content locale derives from the URL locale (null = English source) and
  // drives the news_translations overlay.
  const contentLocale = resolveContentLocale(params.locale);

  // First page is fetched on the server for a fast initial render;
  // subsequent pages (and tab/filter changes) load client-side via /api/news.
  // Hot in Korea curated list is fetched in parallel (empty → section hidden).
  const [{ items, total }, hotItems] = await Promise.all([
    getNewsPage("all", 0, undefined, INITIAL_CATEGORY, contentLocale),
    getHotNewsList(contentLocale),
  ]);

  // Geo gate (set by middleware). Hidden only on explicit "false".
  const showBanner = headers().get(SHOW_BANNER_HEADER) !== "false";

  return (
    <div className="mx-auto flex max-w-container flex-col gap-10 px-4 py-8 sm:px-6">
      <MarketTicker />
      {showBanner && <SignupBanner />}
      <HotInKoreaCarousel items={hotItems} />
      <NewsList
        initialItems={items}
        initialTotal={total}
        initialCategory={INITIAL_CATEGORY}
      />
    </div>
  );
}
