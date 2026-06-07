"use client";

import { useCallback, useRef, useState } from "react";
import { NewsFilter, NewsPreview } from "@/types/news";
import { NewsFilterTabs } from "./NewsFilterTabs";
import { NewsCard } from "./NewsCard";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/lib/hooks/useAuth";
import { SignupGateModal } from "@/components/access/SignupGateModal";
import { BybitGateModal } from "@/components/access/BybitGateModal";
import { NEWS_PAGE_SIZE } from "@/lib/constants/news";

interface Props {
  /** First page, fetched on the server for fast initial render. */
  initialItems: NewsPreview[];
  initialTotal: number;
}

interface NewsPageResponse {
  items: NewsPreview[];
  total: number;
}

export function NewsList({ initialItems, initialTotal }: Props) {
  const [filter, setFilter] = useState<NewsFilter>("all");
  const [items, setItems] = useState<NewsPreview[]>(initialItems);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [gate, setGate] = useState<"none" | "signup" | "bybit">("none");
  const { tier } = useAuth();

  const sectionRef = useRef<HTMLElement | null>(null);
  const totalPages = Math.max(1, Math.ceil(total / NEWS_PAGE_SIZE));

  // premium → navigate; free → Bybit modal; guest → sign-up modal.
  const handleBlockedClick =
    tier === "premium"
      ? undefined
      : () => setGate(tier === "guest" ? "signup" : "bybit");

  const fetchPage = useCallback(
    async (nextFilter: NewsFilter, nextPage: number, scroll: boolean) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/news?filter=${nextFilter}&page=${nextPage}`
        );
        const data: NewsPageResponse = await res.json();
        setItems(data.items);
        setPage(nextPage);
        setTotal(data.total);
        if (scroll) {
          sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const changeFilter = useCallback(
    (next: NewsFilter) => {
      setFilter(next);
      fetchPage(next, 0, false);
    },
    [fetchPage]
  );

  const changePage = useCallback(
    (next: number) => {
      if (next < 0 || next >= totalPages || next === page) return;
      fetchPage(filter, next, true);
    },
    [fetchPage, filter, page, totalPages]
  );

  return (
    <section ref={sectionRef} aria-label="News" className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-foreground">
        News & Disclosures
      </h2>

      <NewsFilterTabs active={filter} onChange={changeFilter} />

      {loading ? (
        <p className="py-12 text-center text-sm text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          No items for this filter.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item) => (
            <NewsCard
              key={item.id}
              item={item}
              onBlockedClick={handleBlockedClick}
            />
          ))}
        </div>
      )}

      <div className="pt-2">
        <Pagination page={page} totalPages={totalPages} onChange={changePage} />
      </div>

      <SignupGateModal
        open={gate === "signup"}
        onClose={() => setGate("none")}
      />
      <BybitGateModal open={gate === "bybit"} onClose={() => setGate("none")} />
    </section>
  );
}
