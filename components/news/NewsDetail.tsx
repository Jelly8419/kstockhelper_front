import { NewsDetailItem } from "@/types/news";
import { TICKER_LABEL } from "@/lib/constants/tickers";
import { Badge } from "@/components/ui/Badge";
import { formatRegisteredTime } from "@/lib/utils/format";

export function NewsDetail({ item }: { item: NewsDetailItem }) {
  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {item.tickers.map((t) => (
            <Badge key={t} tone="brand">
              {TICKER_LABEL[t]}
            </Badge>
          ))}
          <Badge tone="neutral">
            {item.category === "disclosure" ? "Disclosure" : "News"}
          </Badge>
          <span className="ml-auto text-xs text-muted">
            {formatRegisteredTime(item.publishedAt)}
          </span>
        </div>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          {item.title}
        </h1>
      </header>

      {/* Summary */}
      {item.summary && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted">Summary</h2>
          <p className="text-base leading-relaxed text-foreground">
            {item.summary}
          </p>
        </section>
      )}

      {/* Key points (variable length, up to 3) */}
      {item.keyPoints && item.keyPoints.length > 0 && (
        <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-muted">Key Points</h2>
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
          <h2 className="text-sm font-semibold text-muted">Key Figures</h2>
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
    </article>
  );
}
