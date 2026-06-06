import { MarketItem } from "@/types/market";
import {
  changeDirection,
  formatChange,
  formatChangeRate,
  formatNumber,
} from "@/lib/utils/format";

export function MarketCard({ item }: { item: MarketItem }) {
  const valueDigits = item.kind === "index" ? 2 : 0;

  // FX (and any row without change data) shows "-" instead of a delta.
  const hasChange = item.change != null && item.changeRate != null;
  const dir = hasChange ? changeDirection(item.changeRate!) : "flat";
  const toneClass =
    dir === "up" ? "text-up" : dir === "down" ? "text-down" : "text-muted";

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-hover">
      <span className="truncate text-xs font-medium text-muted">{item.name}</span>
      <span className="font-mono text-lg font-semibold text-foreground">
        {formatNumber(item.value, valueDigits)}
        {item.unit ? (
          <span className="ml-1 text-xs text-muted">{item.unit}</span>
        ) : null}
      </span>
      <span className={`text-xs font-medium ${toneClass}`}>
        {hasChange
          ? `${formatChange(item.change!, valueDigits)} (${formatChangeRate(
              item.changeRate!
            )})`
          : "-"}
      </span>
    </div>
  );
}
