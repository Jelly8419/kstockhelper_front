import { MarketTicker } from "@/components/market/MarketTicker";
import { SignupBanner } from "@/components/banner/SignupBanner";
import { NewsList } from "@/components/news/NewsList";
import { MOCK_NEWS } from "@/lib/mock/newsData";

export default function Home() {
  return (
    <div className="mx-auto flex max-w-container flex-col gap-10 px-4 py-8 sm:px-6">
      <MarketTicker />
      <SignupBanner />
      <NewsList items={MOCK_NEWS} />
    </div>
  );
}
