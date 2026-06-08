"use client";

import { useCallback, useRef, useState } from "react";
import { NewsCategory, NewsFilter, NewsPreview } from "@/types/news";
import { NewsTypeTabs } from "./NewsTypeTabs";
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
  /** Content type the server-rendered first page was fetched for. */
  initialCategory: NewsCategory;
}

interface NewsPageResponse {
  items: NewsPreview[];
  total: number;
}

export function NewsList({
  initialItems,
  initialTotal,
  initialCategory,
}: Props) {
  const [category, setCategory] = useState<NewsCategory>(initialCategory);
  const [filter, setFilter] = useState<NewsFilter>("all");
  const [items, setItems] = useState<NewsPreview[]>(initialItems);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [gate, setGate] = useState<"none" | "signup" | "bybit">("none");
  const { tier } = useAuth();

  const sectionRef = useRef<HTMLElement | null>(null);
  // Tracks the in-flight request so rapid tab/filter switches cancel the
  // previous one — avoids wasted requests and out-of-order responses
  // (a slow earlier fetch overwriting a newer result).
  const abortRef = useRef<AbortController | null>(null);
  const totalPages = Math.max(1, Math.ceil(total / NEWS_PAGE_SIZE));

  // premium → navigate; free → Bybit modal; guest → sign-up modal.
  const handleBlockedClick =
    tier === "premium"
      ? undefined
      : () => setGate(tier === "guest" ? "signup" : "bybit");

  const fetchPage = useCallback(
    async (
      nextCategory: NewsCategory,
      nextFilter: NewsFilter,
      nextPage: number,
      scroll: boolean
    ) => {
      // Cancel any request still in flight before starting a new one.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      try {
        const res = await fetch(
          `/api/news?category=${nextCategory}&filter=${nextFilter}&page=${nextPage}`,
          { signal: controller.signal }
        );
        const data: NewsPageResponse = await res.json();
        setItems(data.items);
        setPage(nextPage);
        setTotal(data.total);
        if (scroll) {
          sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } catch (err) {
        // Aborts (superseded by a newer request) are expected — ignore them.
        // Other failures leave the current list in place, same as before.
        if ((err as Error).name !== "AbortError") {
          console.error("news fetch failed:", err);
        }
      } finally {
        // Only the latest request clears the loading state — a cancelled one
        // must not flip it off while its replacement is still loading.
        if (abortRef.current === controller) setLoading(false);
      }
    },
    []
  );

  // Switching content type resets the ticker filter and pagination.
  const changeCategory = useCallback(
    (next: NewsCategory) => {
      setCategory(next);
      setFilter("all");
      fetchPage(next, "all", 0, false);
    },
    [fetchPage]
  );

  const changeFilter = useCallback(
    (next: NewsFilter) => {
      setFilter(next);
      fetchPage(category, next, 0, false);
    },
    [fetchPage, category]
  );

  const changePage = useCallback(
    (next: number) => {
      if (next < 0 || next >= totalPages || next === page) return;
      fetchPage(category, filter, next, true);
    },
    [fetchPage, category, filter, page, totalPages]
  );

  return (
    <section ref={sectionRef} aria-label="News" className="flex flex-col gap-4">
      <NewsTypeTabs active={category} onChange={changeCategory} />

      <NewsFilterTabs active={filter} onChange={changeFilter} />

      {loading ? (
        <p className="py-12 text-center text-sm text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          No {category === "news" ? "news" : "disclosures"} for this filter.
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
