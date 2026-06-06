import { MarketTicker } from "@/components/market/MarketTicker";
import { SignupBanner } from "@/components/banner/SignupBanner";
import { NewsList } from "@/components/news/NewsList";
import { getNewsList } from "@/lib/api/news";

// Real-time content — always fetch fresh.
export const dynamic = "force-dynamic";

export default async function Home() {
  const news = await getNewsList();

  return (
    <div className="mx-auto flex max-w-container flex-col gap-10 px-4 py-8 sm:px-6">
      <MarketTicker />
      <SignupBanner />
      <NewsList items={news} />
    </div>
  );
}
