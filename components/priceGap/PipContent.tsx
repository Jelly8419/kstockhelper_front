"use client";

import type { Exchange, StockCode, PriceGapRow } from "@/types/priceGap";
import { PRICE_GAP_STOCK_ORDER, PRICE_GAP_STOCKS } from "@/types/priceGap";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { usePriceGapLatest } from "@/lib/hooks/usePriceGapLatest";
import { formatNumber } from "@/lib/utils/format";
import { kstTime } from "@/lib/utils/kst";
import { STOCK_COLORS } from "./colors";
import { PriceGapChart } from "./PriceGapChart";

/** code → frontend display name (ignore backend's localized stockName). */
const STOCK_NAME: Record<StockCode, string> = Object.fromEntries(
  PRICE_GAP_STOCKS.map((s) => [s.code, s.name])
) as Record<StockCode, string>;

/** Group the 6 latest rows by stock, keeping display order. */
function pivot(rows: PriceGapRow[]) {
  const by: Record<string, { binance?: PriceGapRow; bybit?: PriceGapRow }> = {};
  for (const r of rows) {
    (by[r.stockCode] ??= {})[r.exchange] = r;
  }
  return PRICE_GAP_STOCK_ORDER.filter((c) => by[c]).map((code) => ({
    code: code as StockCode,
    name: STOCK_NAME[code],
    binance: by[code].binance,
    bybit: by[code].bybit,
  }));
}

function gapText(gap: number | null) {
  if (gap == null) return <span className="text-muted">—</span>;
  const cls = gap > 0 ? "text-up" : gap < 0 ? "text-down" : "";
  return (
    <span className={`font-semibold ${cls}`}>
      {gap > 0 ? "+" : ""}
      {gap.toFixed(2)}%
    </span>
  );
}

/**
 * Content rendered into the Document Picture-in-Picture window: a compact
 * summary table (Ref / Price / Gap per stock for both exchanges) plus a mini
 * chart for the selected exchange/stocks. Premium-only; polls realtime.
 */
export function PipContent({
  exchange,
  stocks,
}: {
  exchange: Exchange;
  stocks: StockCode[];
}) {
  const { t } = useTranslation();
  const { data } = usePriceGapLatest("premium");
  const rows = data ? pivot(data.rows) : [];

  return (
    <div className="flex h-full flex-col gap-2 bg-background p-3 text-foreground">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          {t("priceGap.title")}
          <span className="flex items-center gap-1 text-xs font-normal text-up">
            <span className="h-1.5 w-1.5 rounded-full bg-up" />
            {t("priceGap.pip.live")}
          </span>
        </span>
        <span className="text-xs text-muted">
          {data ? `${kstTime(data.serverTime)} KST` : "—"}
        </span>
      </div>

      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-[10px] text-muted">
            <th className="py-1 font-medium">{t("priceGap.table.stock")}</th>
            <th className="py-1 text-right font-medium">Ref</th>
            <th className="py-1 text-right font-medium">B</th>
            <th className="py-1 text-right font-medium">Gap</th>
            <th className="py-1 text-right font-medium">Y</th>
            <th className="py-1 text-right font-medium">Gap</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const ref = row.binance?.usdRef ?? row.bybit?.usdRef ?? null;
            return (
              <tr key={row.code} className="border-t border-border">
                <td className="py-1">
                  <span className="flex items-center gap-1">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: STOCK_COLORS[row.code] }}
                    />
                    {row.name}
                  </span>
                </td>
                <td className="py-1 text-right">
                  {ref != null ? formatNumber(ref, 2) : "—"}
                </td>
                <td className="py-1 text-right">
                  {row.binance?.exPrice != null
                    ? formatNumber(row.binance.exPrice, 2)
                    : "—"}
                </td>
                <td className="py-1 text-right">{gapText(row.binance?.gap ?? null)}</td>
                <td className="py-1 text-right">
                  {row.bybit?.exPrice != null
                    ? formatNumber(row.bybit.exPrice, 2)
                    : "—"}
                </td>
                <td className="py-1 text-right">{gapText(row.bybit?.gap ?? null)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="min-h-0 flex-1">
        <PriceGapChart
          tier="premium"
          exchange={exchange}
          stocks={stocks}
          heightClass="h-full"
        />
      </div>
    </div>
  );
}
