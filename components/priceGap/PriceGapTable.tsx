"use client";

import type { PriceGapLatest, PriceGapRow, StockCode } from "@/types/priceGap";
import { PRICE_GAP_STOCK_ORDER } from "@/types/priceGap";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { formatNumber, changeDirection } from "@/lib/utils/format";
import { STOCK_COLORS } from "./colors";

/** Group the 6 flat rows into { binance, bybit } per stock, in display order. */
function pivot(rows: PriceGapRow[]) {
  const by: Record<
    string,
    { name: string; binance?: PriceGapRow; bybit?: PriceGapRow }
  > = {};
  for (const r of rows) {
    (by[r.stockCode] ??= { name: r.stockName })[r.exchange] = r;
  }
  return PRICE_GAP_STOCK_ORDER.filter((code) => by[code]).map((code) => ({
    code: code as StockCode,
    name: by[code].name,
    binance: by[code].binance,
    bybit: by[code].bybit,
  }));
}

/** Korean market convention: rise/positive = up (red), fall/negative = down (blue). */
function dirClass(dir: "up" | "down" | "flat"): string {
  return dir === "up" ? "text-up" : dir === "down" ? "text-down" : "";
}

/** Color a price by direction vs the previous poll's matching row (no % shown). */
function priceCell(cur: number | null, prevVal: number | null | undefined) {
  if (cur == null) return <span className="text-muted">—</span>;
  const dir =
    prevVal == null ? "flat" : changeDirection(cur - prevVal);
  return <span className={dirClass(dir)}>{formatNumber(cur, 2)}</span>;
}

function krCell(cur: number | null, prevVal: number | null | undefined) {
  if (cur == null) return <span className="text-muted">—</span>;
  const dir = prevVal == null ? "flat" : changeDirection(cur - prevVal);
  return <span className={dirClass(dir)}>{formatNumber(cur, 0)}</span>;
}

/** Gap %: signed, colored by sign (positive red, negative blue). */
function gapCell(gap: number | null) {
  if (gap == null) return <span className="text-muted">—</span>;
  const dir = gap > 0 ? "up" : gap < 0 ? "down" : "flat";
  const sign = gap > 0 ? "+" : "";
  return (
    <span className={`font-semibold ${dirClass(dir)}`}>
      {sign}
      {gap.toFixed(2)}%
    </span>
  );
}

export function PriceGapTable({
  data,
  prev,
  isLoading,
}: {
  data: PriceGapLatest | null;
  prev: PriceGapLatest | null;
  isLoading: boolean;
}) {
  const { t } = useTranslation();

  if (isLoading && !data) {
    return <p className="text-sm text-muted">{t("common.loading")}</p>;
  }

  const rows = data ? pivot(data.rows) : [];
  // Look up the previous matching row (same stock+exchange) for coloring.
  const prevOf = (code: StockCode, exchange: "binance" | "bybit") =>
    prev?.rows.find((r) => r.stockCode === code && r.exchange === exchange);

  const usdtKrw = data?.usdtKrw?.price;

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[860px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted">
            <th className="px-4 py-3 font-medium">{t("priceGap.table.stock")}</th>
            <th className="px-4 py-3 text-right font-medium">
              {t("priceGap.table.krPrice")}
              <span className="block text-[10px] font-normal">(KRW)</span>
            </th>
            <th className="px-4 py-3 text-right font-medium">
              {t("priceGap.table.referencePrice")}
              <span className="block text-[10px] font-normal">
                {usdtKrw
                  ? `(USDT/KRW ${formatNumber(usdtKrw, 2)})`
                  : "(USDT)"}
              </span>
            </th>
            <th
              className="px-4 py-3 text-right font-medium"
              colSpan={2}
            >
              {t("priceGap.table.binance")}{" "}
              <span className="text-[10px] font-normal">(USDT)</span>
            </th>
            <th
              className="px-4 py-3 text-right font-medium"
              colSpan={2}
            >
              {t("priceGap.table.bybit")}{" "}
              <span className="text-[10px] font-normal">(USDT)</span>
            </th>
          </tr>
          <tr className="border-b border-border text-right text-[10px] text-muted">
            <th />
            <th />
            <th />
            <th className="px-4 py-2 font-normal">
              {t("priceGap.table.price")}
            </th>
            <th className="px-4 py-2 font-normal">{t("priceGap.table.gap")}</th>
            <th className="px-4 py-2 font-normal">
              {t("priceGap.table.price")}
            </th>
            <th className="px-4 py-2 font-normal">{t("priceGap.table.gap")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.code} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: STOCK_COLORS[row.code] }}
                  />
                  {row.name}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                {krCell(
                  row.binance?.krPrice ?? row.bybit?.krPrice ?? null,
                  prevOf(row.code, "binance")?.krPrice
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {row.binance?.usdRef != null || row.bybit?.usdRef != null ? (
                  formatNumber(
                    (row.binance?.usdRef ?? row.bybit?.usdRef) as number,
                    2
                  )
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {priceCell(
                  row.binance?.exPrice ?? null,
                  prevOf(row.code, "binance")?.exPrice
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {gapCell(row.binance?.gap ?? null)}
              </td>
              <td className="px-4 py-3 text-right">
                {priceCell(
                  row.bybit?.exPrice ?? null,
                  prevOf(row.code, "bybit")?.exPrice
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {gapCell(row.bybit?.gap ?? null)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
