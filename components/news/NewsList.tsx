"use client";

import { useMemo, useState } from "react";
import { NewsFilter, NewsItem } from "@/types/news";
import { NewsFilterTabs } from "./NewsFilterTabs";
import { NewsCard } from "./NewsCard";
import { useAuth } from "@/lib/hooks/useAuth";
import { SignupGateModal } from "@/components/access/SignupGateModal";
import { PremiumGateModal } from "@/components/access/PremiumGateModal";

export function NewsList({ items }: { items: NewsItem[] }) {
  const [filter, setFilter] = useState<NewsFilter>("all");
  const [gate, setGate] = useState<"none" | "signup" | "premium">("none");
  const { tier } = useAuth();

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((n) => n.tickers.includes(filter));
  }, [items, filter]);

  // Premium users navigate directly; others get a gate modal on click.
  const handleBlockedClick =
    tier === "premium"
      ? undefined
      : () => setGate(tier === "guest" ? "signup" : "premium");

  return (
    <section aria-label="News" className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-foreground">
        News & Disclosures
      </h2>

      <NewsFilterTabs active={filter} onChange={setFilter} />

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          No items for this filter.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((item) => (
            <NewsCard
              key={item.id}
              item={item}
              onBlockedClick={handleBlockedClick}
            />
          ))}
        </div>
      )}

      <SignupGateModal open={gate === "signup"} onClose={() => setGate("none")} />
      <PremiumGateModal open={gate === "premium"} onClose={() => setGate("none")} />
    </section>
  );
}
