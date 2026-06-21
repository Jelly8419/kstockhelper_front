"use client";

import { useCallback, useRef, useState } from "react";
import {
  ContentTypeFilter,
  NewsPreview,
  TickerLabel,
} from "@/types/news";
import { NewsTypeTabs } from "./NewsTypeTabs";
import { NewsFilterTabs } from "./NewsFilterTabs";
import { NewsCard } from "./NewsCard";
import { Pagination } from "@/components/ui/Pagination";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useTrackEvent } from "@/lib/analytics/useTrackEvent";
import { NEWS_PAGE_SIZE } from "@/lib/constants/news";

interface Props {
  /** First page, fetched on the server for fast initial render. */
  initialItems: NewsPreview[];
  initialTotal: number;
  /** Content type the server-rendered first page was fetched for. */
  initialCategory: ContentTypeFilter;
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
  const [category, setCategory] = useState<ContentTypeFilter>(initialCategory);
  // Selected companies; empty = "All" (no company filter).
  const [tickers, setTickers] = useState<TickerLabel[]>([]);
  const [items, setItems] = useState<NewsPreview[]>(initialItems);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const { t, locale } = useTranslation();
  const track = useTrackEvent();

  const sectionRef = useRef<HTMLElement | null>(null);
  // Tracks the in-flight request so rapid tab/filter switches cancel the
  // previous one — avoids wasted requests and out-of-order responses
  // (a slow earlier fetch overwriting a newer result).
  const abortRef = useRef<AbortController | null>(null);
  const totalPages = Math.max(1, Math.ceil(total / NEWS_PAGE_SIZE));

  const fetchPage = useCallback(
    async (
      nextCategory: ContentTypeFilter,
      nextTickers: TickerLabel[],
      nextPage: number,
      scroll: boolean
    ) => {
      // Cancel any request still in flight before starting a new one.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // "all" content type → omit category param (both news and disclosures).
      const categoryParam =
        nextCategory === "all" ? "" : `&category=${nextCategory}`;
      const tickersParam = nextTickers.length
        ? `&tickers=${nextTickers.join(",")}`
        : "";

      setLoading(true);
      try {
        const res = await fetch(
          `/api/news?page=${nextPage}&locale=${locale}${categoryParam}${tickersParam}`,
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
    [locale]
  );

  // Any filter change resets pagination to the first page.
  const changeCategory = useCallback(
    (next: ContentTypeFilter) => {
      track("home_news_filter_clicked", { filter_type: "type", value: next });
      setCategory(next);
      fetchPage(next, tickers, 0, false);
    },
    [fetchPage, tickers, track]
  );

  // Toggle one company; clearing the last selection falls back to "All".
  const toggleTicker = useCallback(
    (ticker: TickerLabel) => {
      const next = tickers.includes(ticker)
        ? tickers.filter((t) => t !== ticker)
        : [...tickers, ticker];
      track("home_news_filter_clicked", { filter_type: "company", value: ticker });
      setTickers(next);
      fetchPage(category, next, 0, false);
    },
    [fetchPage, category, tickers, track]
  );

  // "All" company button: clear the selection (no-op if already empty).
  const resetTickers = useCallback(() => {
    if (tickers.length === 0) return;
    track("home_news_filter_clicked", { filter_type: "company", value: "all" });
    setTickers([]);
    fetchPage(category, [], 0, false);
  }, [fetchPage, category, tickers, track]);

  const changePage = useCallback(
    (next: number) => {
      if (next < 0 || next >= totalPages || next === page) return;
      fetchPage(category, tickers, next, true);
    },
    [fetchPage, category, tickers, page, totalPages]
  );

  return (
    <section
      ref={sectionRef}
      aria-label={t("news.ariaList")}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-foreground">
          {t("news.sectionTitle")}
        </h2>
        <p className="text-sm text-muted">{t("news.sectionDescription")}</p>
      </div>

      <NewsTypeTabs active={category} onChange={changeCategory} />

      <NewsFilterTabs
        active={tickers}
        onToggle={toggleTicker}
        onReset={resetTickers}
      />

      {loading ? (
        <p className="py-12 text-center text-sm text-muted">
          {t("common.loading")}
        </p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-1 py-12 text-center">
          <p className="text-sm font-medium text-foreground">
            {t("news.empty")}
          </p>
          <p className="text-sm text-muted">{t("news.emptyHint")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <div className="pt-2">
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={changePage}
          labels={{
            aria: t("pagination.aria"),
            previous: t("pagination.previous"),
            next: t("pagination.next"),
          }}
        />
      </div>
    </section>
  );
}
