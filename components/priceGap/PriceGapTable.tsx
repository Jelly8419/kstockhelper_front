"use client";

import type { PriceGapLatest, PriceGapRow, StockCode } from "@/types/priceGap";
import { PRICE_GAP_STOCK_ORDER, PRICE_GAP_STOCKS } from "@/types/priceGap";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { formatNumber, changeDirection } from "@/lib/utils/format";
import { STOCK_COLORS } from "./colors";

/** Stable code → display name from the frontend constant (ignore backend's localized stockName). */
const STOCK_NAME: Record<StockCode, string> = Object.fromEntries(
  PRICE_GAP_STOCKS.map((s) => [s.code, s.name])
) as Record<StockCode, string>;

/** Group the 6 flat rows into { binance, bybit } per stock, in display order. */
function pivot(rows: PriceGapRow[]) {
  const by: Record<
    string,
    { binance?: PriceGapRow; bybit?: PriceGapRow }
  > = {};
  for (const r of rows) {
    (by[r.stockCode] ??= {})[r.exchange] = r;
  }
  return PRICE_GAP_STOCK_ORDER.filter((code) => by[code]).map((code) => ({
    code: code as StockCode,
    name: STOCK_NAME[code],
    binance: by[code].binance,
    bybit: by[code].bybit,
  }));
}

/** Price-gap convention: positive = green (gain), negative = red. */
function dirClass(dir: "up" | "down" | "flat"): string {
  return dir === "up" ? "text-gain" : dir === "down" ? "text-up" : "";
}

/** Color a price by direction vs the previous poll's matching row (no % shown). */
function priceCell(cur: number | null, prevVal: number | null | undefined) {
  if (cur == null) return <span className="text-muted">—</span>;
  const dir = prevVal == null ? "flat" : changeDirection(cur - prevVal);
  return <span className={dirClass(dir)}>{formatNumber(cur, 2)}</span>;
}

function krCell(cur: number | null, prevVal: number | null | undefined) {
  if (cur == null) return <span className="text-muted">—</span>;
  const dir = prevVal == null ? "flat" : changeDirection(cur - prevVal);
  return <span className={dirClass(dir)}>{formatNumber(cur, 0)}</span>;
}

/** Signed gap %, colored by sign (positive green, negative red). */
function gapPct(gap: number | null) {
  if (gap == null) return <span className="text-muted">—</span>;
  const dir = gap > 0 ? "up" : gap < 0 ? "down" : "flat";
  return (
    <span className={`font-semibold ${dirClass(dir)}`}>
      {gap > 0 ? "+" : ""}
      {gap.toFixed(2)}%
    </span>
  );
}

/** Signed percentage-point delta (Gap vs Past Avg), colored by sign. */
function ppCell(v: number | null) {
  if (v == null) return <span className="text-muted">—</span>;
  const dir = v > 0 ? "up" : v < 0 ? "down" : "flat";
  return (
    <span className={dirClass(dir)}>{`${v > 0 ? "+" : ""}${v.toFixed(2)}%p`}</span>
  );
}

/** Plain Past Avg Gap %, no coloring (it's a baseline, not a live move). */
function pastAvgCell(gap: number | null) {
  if (gap == null) return <span className="text-muted">—</span>;
  return (
    <span className="text-foreground">
      {gap > 0 ? "+" : ""}
      {gap.toFixed(2)}%
    </span>
  );
}

/** One label/value row inside an exchange cell. */
function MetricLine({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] text-muted">{label}</span>
      <span className="tabular-nums">{children}</span>
    </div>
  );
}

/** The 4 stacked metrics inside one exchange cell (PRD §6.3). */
function ExchangeCell({
  row,
  prevRow,
  labels,
}: {
  row: PriceGapRow | undefined;
  prevRow: PriceGapRow | undefined;
  labels: {
    price: string;
    currentGap: string;
    pastAvgGap: string;
    gapVsPastAvg: string;
  };
}) {
  return (
    <td className="px-4 py-3 align-top">
      <div className="flex flex-col gap-0.5">
        <MetricLine label={labels.price}>
          {priceCell(row?.exPrice ?? null, prevRow?.exPrice)}
        </MetricLine>
        <MetricLine label={labels.currentGap}>
          {gapPct(row?.gap ?? null)}
        </MetricLine>
        <MetricLine label={labels.pastAvgGap}>
          {pastAvgCell(row?.pastAvgGap ?? null)}
        </MetricLine>
        <MetricLine label={labels.gapVsPastAvg}>
          {ppCell(row?.gapVsPastAvg ?? null)}
        </MetricLine>
      </div>
    </td>
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
  const prevOf = (code: StockCode, exchange: "binance" | "bybit") =>
    prev?.rows.find((r) => r.stockCode === code && r.exchange === exchange);

  const usdtKrw = data?.usdtKrw?.price;

  const labels = {
    price: t("priceGap.table.price"),
    currentGap: t("priceGap.table.currentGap"),
    pastAvgGap: t("priceGap.table.pastAvgGap"),
    gapVsPastAvg: t("priceGap.table.gapVsPastAvg"),
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[860px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted">
            <th className="px-4 py-3 font-medium">{t("priceGap.table.stock")}</th>
            <th className="px-4 py-3 text-right font-medium">
              {t("priceGap.table.krPrice")}
              <span className="block text-[10px] font-normal">{"(KRW)"}</span>
            </th>
            <th className="px-4 py-3 text-right font-medium">
              {t("priceGap.table.referencePrice")}
              <span className="block text-[10px] font-normal">
                {usdtKrw ? `(USDT/KRW ${formatNumber(usdtKrw, 2)})` : "(USDT)"}
              </span>
            </th>
            <th className="px-4 py-3 text-left font-medium">
              {t("priceGap.table.binance")}{" "}
              <span className="text-[10px] font-normal">{"(USDT)"}</span>
            </th>
            <th className="px-4 py-3 text-left font-medium">
              {t("priceGap.table.bybit")}{" "}
              <span className="text-[10px] font-normal">{"(USDT)"}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.code} className="border-b border-border last:border-0">
              <td className="px-4 py-3 align-top">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: STOCK_COLORS[row.code] }}
                  />
                  {row.name}
                </span>
              </td>
              <td className="px-4 py-3 text-right align-top">
                {krCell(
                  row.binance?.krPrice ?? row.bybit?.krPrice ?? null,
                  prevOf(row.code, "binance")?.krPrice
                )}
              </td>
              <td className="px-4 py-3 text-right align-top">
                {row.binance?.usdRef != null || row.bybit?.usdRef != null ? (
                  formatNumber(
                    (row.binance?.usdRef ?? row.bybit?.usdRef) as number,
                    2
                  )
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <ExchangeCell
                row={row.binance}
                prevRow={prevOf(row.code, "binance")}
                labels={labels}
              />
              <ExchangeCell
                row={row.bybit}
                prevRow={prevOf(row.code, "bybit")}
                labels={labels}
              />
            </tr>
          ))}
        </tbody>
      </table>

      {/* Info note for the two average-based metrics (PRD §6.8). */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-border px-4 py-2 text-[11px] text-muted">
        <span>
          <span className="text-foreground">
            {t("priceGap.table.pastAvgGap")}
          </span>
          {" — "}
          {t("priceGap.table.pastAvgGapTip")}
        </span>
        <span>
          <span className="text-foreground">
            {t("priceGap.table.gapVsPastAvg")}
          </span>
          {" — "}
          {t("priceGap.table.gapVsPastAvgTip")}
        </span>
      </div>
    </div>
  );
}
