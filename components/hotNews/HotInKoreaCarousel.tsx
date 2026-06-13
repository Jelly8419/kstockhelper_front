"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { HotNewsCard } from "./HotNewsCard";
import type { HotNewsPublicItem } from "@/types/hotNews";

/**
 * Hot in Korea carousel (PRD §4). PC shows 4 cards, mobile 2; prev/next at the
 * section top-right move ONE card at a time. No infinite loop — `<` disabled at
 * the start, `>` disabled once the last card is in view. Indicator dots = one
 * per card; active = the leftmost visible card's index. Empty → section hidden.
 */

/** Tailwind `md` breakpoint (px). Below = mobile (2 cards), at/above = PC (4). */
const MD_BREAKPOINT = 768;
const VISIBLE_PC = 4;
const VISIBLE_MOBILE = 2;

export function HotInKoreaCarousel({ items }: { items: HotNewsPublicItem[] }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(VISIBLE_PC);
  const [start, setStart] = useState(0);

  // Track viewport to switch visible count (PC 4 / mobile 2).
  useEffect(() => {
    const update = () => {
      const next =
        window.innerWidth >= MD_BREAKPOINT ? VISIBLE_PC : VISIBLE_MOBILE;
      setVisible(next);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Clamp the start index when visible count or item count changes so we never
  // scroll past the last full window.
  const maxStart = Math.max(0, items.length - visible);
  useEffect(() => {
    setStart((s) => Math.min(s, maxStart));
  }, [maxStart]);

  // Empty → hide the whole section (PRD 12.1).
  if (items.length === 0) return null;

  const atStart = start === 0;
  const atEnd = start >= maxStart;

  const prev = () => setStart((s) => Math.max(0, s - 1));
  const next = () => setStart((s) => Math.min(maxStart, s + 1));

  // Each card occupies (100 / visible)% of the track; translate by whole cards.
  const cardBasis = `${100 / visible}%`;
  const translatePct = (start * 100) / visible;

  return (
    <section aria-label={t("hotNews.carouselAria")} className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <span aria-hidden="true">🔥</span>
            {t("hotNews.sectionTitle")}
          </h2>
          <p className="text-sm text-muted">{t("hotNews.sectionDescription")}</p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={prev}
            disabled={atStart}
            aria-label={t("hotNews.prevAria")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            disabled={atEnd}
            aria-label={t("hotNews.nextAria")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>

      {/* Viewport clips the track; the track slides by whole-card steps. */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${translatePct}%)` }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="shrink-0 px-2 first:pl-0 last:pr-0"
              style={{ flexBasis: cardBasis }}
            >
              <HotNewsCard item={item} />
            </div>
          ))}
        </div>
      </div>

      {/* Indicator dots — one per card, active = leftmost visible (PRD 4.8). */}
      {items.length > visible && (
        <div className="flex justify-center gap-1.5">
          {items.map((_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`h-1.5 rounded-full transition-all ${
                i === start ? "w-4 bg-brand" : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
