import { NewsItem } from "@/types/news";
import { TICKER_LABEL } from "@/lib/mock/newsData";
import { Badge } from "@/components/ui/Badge";
import { formatRegisteredTime } from "@/lib/utils/format";

export function NewsDetail({ item }: { item: NewsItem }) {
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
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted">Summary</h2>
        <p className="text-base leading-relaxed text-foreground">{item.summary}</p>
      </section>

      {/* Key points (exactly 3) */}
      <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-muted">Key Points</h2>
        <ul className="flex flex-col gap-2">
          {item.keyPoints.map((point, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-semibold text-brand">
                {i + 1}
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
