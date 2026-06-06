"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NewsFilter, NewsPreview } from "@/types/news";
import { NewsFilterTabs } from "./NewsFilterTabs";
import { NewsCard } from "./NewsCard";
import { useAuth } from "@/lib/hooks/useAuth";
import { SignupGateModal } from "@/components/access/SignupGateModal";

interface Props {
  /** First page, fetched on the server for fast initial render. */
  initialItems: NewsPreview[];
  initialHasMore: boolean;
}

export function NewsList({ initialItems, initialHasMore }: Props) {
  const [filter, setFilter] = useState<NewsFilter>("all");
  const [items, setItems] = useState<NewsPreview[]>(initialItems);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const { tier } = useAuth();

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Members navigate directly; guests get a sign-up modal on click.
  const handleBlockedClick =
    tier === "member" ? undefined : () => setGateOpen(true);

  // Load the next page for the current filter.
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const next = page + 1;
      const res = await fetch(`/api/news?filter=${filter}&page=${next}`);
      const data: { items: NewsPreview[]; hasMore: boolean } = await res.json();
      setItems((prev) => [...prev, ...data.items]);
      setPage(next);
      setHasMore(data.hasMore);
    } catch {
      // Network hiccup — stop here; the sentinel can retry on next scroll.
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, filter]);

  // Reset and refetch from page 0 when the filter changes.
  const changeFilter = useCallback(async (next: NewsFilter) => {
    setFilter(next);
    setLoading(true);
    setItems([]);
    setHasMore(false);
    try {
      const res = await fetch(`/api/news?filter=${next}&page=0`);
      const data: { items: NewsPreview[]; hasMore: boolean } = await res.json();
      setItems(data.items);
      setPage(0);
      setHasMore(data.hasMore);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load the next page when the sentinel scrolls into view.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <section aria-label="News" className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-foreground">
        News & Disclosures
      </h2>

      <NewsFilterTabs active={filter} onChange={changeFilter} />

      {items.length === 0 && !loading ? (
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

      {/* Sentinel + loading / end-of-list indicator */}
      <div ref={sentinelRef} className="flex justify-center py-6">
        {loading ? (
          <span className="text-sm text-muted">Loading…</span>
        ) : !hasMore && items.length > 0 ? (
          <span className="text-xs text-muted">You&apos;re all caught up.</span>
        ) : null}
      </div>

      <SignupGateModal open={gateOpen} onClose={() => setGateOpen(false)} />
    </section>
  );
}
