import { NewsItem, TickerLabel, TickerMeta } from "@/types/news";

/** Ticker filter metadata, drives the filter tabs. */
export const TICKERS: TickerMeta[] = [
  { id: "samsung", label: "Samsung" },
  { id: "skhynix", label: "SK Hynix" },
  { id: "hyundai", label: "Hyundai" },
];

/** Map ticker id → short display label. */
export const TICKER_LABEL: Record<TickerLabel, string> = {
  samsung: "Samsung",
  skhynix: "SK Hynix",
  hyundai: "Hyundai",
};

/**
 * Mock news / disclosure items.
 * TODO: replace with real translated API content (DART, news source).
 */
export const MOCK_NEWS: NewsItem[] = [
  {
    id: "1",
    category: "disclosure",
    tickers: ["samsung"],
    title: "Samsung Electronics announces KRW 10tn share buyback program",
    body: "Samsung Electronics disclosed a new share buyback program worth approximately 10 trillion won, to be executed over the next twelve months. The board approved the plan citing strong cash reserves and a commitment to enhancing shareholder value. A portion of the repurchased shares will be cancelled, while the remainder will be held as treasury stock for future use. Management emphasized that the buyback reflects confidence in the company's long-term semiconductor and mobile businesses despite near-term market volatility.",
    publishedAt: "2026-06-05T00:30:00Z",
    summary:
      "Samsung will buy back about KRW 10tn of its own shares over a year, partly cancelling them to lift shareholder value.",
    keyPoints: [
      "KRW 10tn buyback approved by the board, executed over 12 months.",
      "Part of repurchased shares to be cancelled, rest held as treasury stock.",
      "Signals management confidence amid near-term market volatility.",
    ],
  },
  {
    id: "2",
    category: "news",
    tickers: ["skhynix"],
    title: "SK hynix ramps HBM4 production ahead of schedule",
    body: "SK hynix said it is accelerating mass production of its next-generation HBM4 memory, moving the timeline ahead of earlier guidance. The company pointed to surging demand from AI accelerator customers and a tight supply environment. Executives noted that the early ramp could meaningfully expand the firm's lead in the high-bandwidth memory segment, where it currently holds a dominant market share. Analysts expect the move to support margins through the next several quarters.",
    publishedAt: "2026-06-04T22:10:00Z",
    summary:
      "SK hynix is pulling forward HBM4 mass production to meet AI-driven demand, potentially widening its HBM lead.",
    keyPoints: [
      "HBM4 mass production moved ahead of earlier guidance.",
      "Driven by strong AI accelerator demand and tight supply.",
      "Expected to support margins over the next several quarters.",
    ],
  },
  {
    id: "3",
    category: "news",
    tickers: ["hyundai"],
    title: "Hyundai Motor unveils next-gen EV platform targeting global markets",
    body: "Hyundai Motor revealed a new dedicated electric vehicle platform designed to underpin its next wave of global EV launches. The platform promises improved range, faster charging, and lower production costs through greater parts standardization. The company reaffirmed its target to significantly grow EV sales volume by the end of the decade. Hyundai also highlighted planned investments in North American and European production capacity to localize manufacturing and qualify for regional incentives.",
    publishedAt: "2026-06-04T15:45:00Z",
    summary:
      "Hyundai introduced a new EV platform with better range and lower cost, backing its global EV growth targets.",
    keyPoints: [
      "New dedicated EV platform improves range, charging, and cost.",
      "Supports Hyundai's plan to grow EV volume by end of decade.",
      "Investments planned in North American and European capacity.",
    ],
  },
  {
    id: "4",
    category: "disclosure",
    tickers: ["samsung", "skhynix"],
    title: "Memory makers report stronger-than-expected DRAM pricing",
    body: "Both Samsung Electronics and SK hynix indicated in recent disclosures that DRAM contract prices rose more than expected this quarter, driven by datacenter and AI demand. The pricing strength comes as suppliers maintain disciplined capacity additions. Industry observers see the trend extending into the second half of the year, which would benefit memory-heavy earnings for the two Korean leaders. Both companies cautioned that consumer electronics demand remains comparatively soft.",
    publishedAt: "2026-06-03T09:00:00Z",
    summary:
      "DRAM contract prices rose more than expected on AI demand, benefiting both Samsung and SK hynix.",
    keyPoints: [
      "DRAM contract prices beat expectations this quarter.",
      "Driven by datacenter / AI demand and disciplined supply.",
      "Consumer electronics demand still relatively soft.",
    ],
  },
  {
    id: "5",
    category: "news",
    tickers: ["hyundai", "samsung"],
    title: "Korean exporters gain as won weakens against the dollar",
    body: "A weaker Korean won is providing a tailwind for major exporters including Hyundai Motor and Samsung Electronics, according to market commentary. The currency move tends to lift the value of overseas earnings when repatriated and can improve price competitiveness abroad. However, analysts cautioned that imported input costs also rise, partly offsetting the benefit. The net effect varies by company depending on hedging policies and the geographic mix of revenue and costs.",
    publishedAt: "2026-06-02T23:20:00Z",
    summary:
      "A weaker won helps Korean exporters like Hyundai and Samsung, though higher import costs partly offset gains.",
    keyPoints: [
      "Weaker won lifts repatriated overseas earnings.",
      "Improves export price competitiveness abroad.",
      "Higher imported input costs partly offset the benefit.",
    ],
  },
];

/** Look up a single news item by id (mock). */
export function getMockNewsById(id: string): NewsItem | undefined {
  return MOCK_NEWS.find((n) => n.id === id);
}
