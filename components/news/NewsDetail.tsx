"use client";

import { NewsDetailItem } from "@/types/news";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * Locked/premium detail body: full summary, key points, key figures. The public
 * header (title, time, source, related stocks, short summary) is rendered
 * separately by `NewsPublicHeader`, so this component holds only the gated
 * content shown to entitled (premium) users.
 */
export function NewsDetail({ item }: { item: NewsDetailItem }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-6">
      {/* Summary */}
      {item.summary && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted">
            {t("news.summary")}
          </h2>
          <p className="text-base leading-relaxed text-foreground">
            {item.summary}
          </p>
        </section>
      )}

      {/* Key points (variable length, up to 3) */}
      {item.keyPoints && item.keyPoints.length > 0 && (
        <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-muted">
            {t("news.keyPoints")}
          </h2>
          <ul className="flex flex-col gap-2">
            {item.keyPoints.map((point, i) => (
              <li
                key={i}
                className="flex gap-3 text-sm leading-relaxed text-foreground"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-semibold text-brand">
                  {i + 1}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Key figures (disclosures): quantitative table */}
      {item.keyFigures && item.keyFigures.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted">
            {t("news.keyFigures")}
          </h2>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <tbody>
                {item.keyFigures.map((fig, i) => (
                  <tr
                    key={i}
                    className="border-b border-border last:border-0 odd:bg-surface"
                  >
                    <td className="px-4 py-2.5 align-top text-muted">
                      {fig.label}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-medium text-foreground">
                      {fig.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
