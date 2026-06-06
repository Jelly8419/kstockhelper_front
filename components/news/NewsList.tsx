"use client";

import { useMemo, useState } from "react";
import { NewsFilter, NewsPreview } from "@/types/news";
import { NewsFilterTabs } from "./NewsFilterTabs";
import { NewsCard } from "./NewsCard";
import { useAuth } from "@/lib/hooks/useAuth";
import { SignupGateModal } from "@/components/access/SignupGateModal";

export function NewsList({ items }: { items: NewsPreview[] }) {
  const [filter, setFilter] = useState<NewsFilter>("all");
  const [gateOpen, setGateOpen] = useState(false);
  const { tier } = useAuth();

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((n) => n.tickers.includes(filter));
  }, [items, filter]);

  // Members navigate directly; guests get a sign-up modal on click.
  const handleBlockedClick =
    tier === "member" ? undefined : () => setGateOpen(true);

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

      <SignupGateModal open={gateOpen} onClose={() => setGateOpen(false)} />
    </section>
  );
}
