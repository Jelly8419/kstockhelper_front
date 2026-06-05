import { MarketItem } from "@/types/market";

/**
 * Mock market board data.
 * TODO: replace with real API (KRX / FX). Shape matches MarketItem.
 */
export const MOCK_MARKET: MarketItem[] = [
  {
    id: "kospi",
    name: "KOSPI",
    kind: "index",
    value: 2734.36,
    change: 12.45,
    changeRate: 0.46,
  },
  {
    id: "kosdaq",
    name: "KOSDAQ",
    kind: "index",
    value: 869.12,
    change: -3.21,
    changeRate: -0.37,
  },
  {
    id: "usdkrw",
    name: "USD/KRW",
    kind: "index",
    value: 1378.5,
    change: 4.2,
    changeRate: 0.31,
  },
  {
    id: "samsung",
    name: "Samsung Electronics",
    kind: "stock",
    value: 81200,
    change: 900,
    changeRate: 1.12,
    unit: "KRW",
  },
  {
    id: "skhynix",
    name: "SK hynix",
    kind: "stock",
    value: 201500,
    change: -2500,
    changeRate: -1.23,
    unit: "KRW",
  },
  {
    id: "hyundai",
    name: "Hyundai Motor",
    kind: "stock",
    value: 248000,
    change: 1000,
    changeRate: 0.4,
    unit: "KRW",
  },
];
