import { headers } from "next/headers";
import { MarketTicker } from "@/components/market/MarketTicker";
import { SignupBanner } from "@/components/banner/SignupBanner";
import { NewsList } from "@/components/news/NewsList";
import { getNewsPage } from "@/lib/api/news";
import { SHOW_BANNER_HEADER } from "@/lib/geo/bannerGate";

// Real-time content — always fetch fresh.
export const dynamic = "force-dynamic";

export default async function Home() {
  // First page is fetched on the server for a fast initial render;
  // subsequent pages load client-side via /api/news (infinite scroll).
  const { items, hasMore } = await getNewsPage("all", 0);

  // Geo gate (set by middleware). Hidden only on explicit "false".
  const showBanner = headers().get(SHOW_BANNER_HEADER) !== "false";

  return (
    <div className="mx-auto flex max-w-container flex-col gap-10 px-4 py-8 sm:px-6">
      <MarketTicker />
      {showBanner && <SignupBanner />}
      <NewsList initialItems={items} initialHasMore={hasMore} />
    </div>
  );
}
