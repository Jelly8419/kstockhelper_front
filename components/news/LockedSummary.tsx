"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * Summary section for non-entitled viewers (guest / free).
 *
 * Shows the public `preview` as real, sharp text, then appends a few blurred
 * dummy lines so the summary reads as "continuing but cut off" (PRD mosaic
 * style). The real remainder of the summary is never sent to non-premium
 * clients (gated in the DB view), so the tail can only be a decorative skeleton.
 *
 * `preview` is the public short summary (always available). When absent we still
 * render the blurred tail so the lock intent is clear.
 */
export function LockedSummary({ preview }: { preview: string | null }) {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-muted">{t("news.summary")}</h2>

      {preview && (
        <p className="text-base leading-relaxed text-foreground">{preview}</p>
      )}

      {/* Blurred dummy tail — mimics the hidden remainder of the summary. */}
      <div
        className="flex select-none flex-col gap-2 blur-[5px]"
        aria-hidden="true"
      >
        {["w-full", "w-11/12", "w-3/4"].map((w, i) => (
          <div key={i} className={`h-4 ${w} rounded bg-muted`} />
        ))}
      </div>
    </section>
  );
}
