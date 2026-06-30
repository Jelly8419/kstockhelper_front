"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin/client";
import { Badge } from "@/components/ui/Badge";
import { formatRegisteredTime } from "@/lib/utils/format";
import { ADMIN_BASE_PATH } from "@/lib/admin/constants";
import {
  RE_STATUS_LABEL,
  RE_STATUS_TONE,
  formatInKorea,
} from "@/lib/admin/display";
import type { RealEstateRequestListItem } from "@/types/admin";

/**
 * Real Estate purchase request list (Admin PRD §4-§5). Fetches newest-first
 * from the BFF, renders a table; each row is clickable → detail page (no
 * separate action column, PRD §5). Mirrors the admin list patterns.
 */
export function RealEstateRequestsClient() {
  const router = useRouter();
  const [items, setItems] = useState<RealEstateRequestListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await adminFetch<{ items: RealEstateRequestListItem[] }>(
        "/api/admin/real-estate-requests"
      );
      if (!active) return;
      if (!res.ok || !res.data) {
        setError(res.message ?? "요청 목록을 불러오지 못했습니다. 다시 시도해 주세요.");
        return;
      }
      setError(null);
      setItems(res.data.items);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (error) return <p className="text-sm text-down">{error}</p>;
  if (!items) return <p className="text-sm text-muted">불러오는 중…</p>;
  if (items.length === 0)
    return <p className="text-sm text-muted">접수된 부동산 구매 요청이 없습니다.</p>;

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface text-left text-xs text-muted">
            <th className="px-4 py-3 font-medium">요청일</th>
            <th className="px-4 py-3 font-medium">거주 국가</th>
            <th className="px-4 py-3 font-medium">이메일</th>
            <th className="px-4 py-3 font-medium">한국 체류 여부</th>
            <th className="px-4 py-3 font-medium">상태</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              onClick={() =>
                router.push(
                  `${ADMIN_BASE_PATH}/real-estate-requests/${item.id}`
                )
              }
              className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-surface-hover"
            >
              <td className="px-4 py-3 text-muted">
                {formatRegisteredTime(item.createdAt)}
              </td>
              <td className="px-4 py-3 text-foreground">
                {item.countryOfResidence}
              </td>
              <td className="px-4 py-3 text-foreground">{item.email}</td>
              <td className="px-4 py-3 text-muted">
                {formatInKorea(item.currentlyInKorea)}
              </td>
              <td className="px-4 py-3">
                <Badge tone={RE_STATUS_TONE[item.status]}>
                  {RE_STATUS_LABEL[item.status]}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
