"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin/client";
import { ADMIN_BASE_PATH } from "@/lib/admin/constants";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { formatRegisteredTime } from "@/lib/utils/format";
import {
  STATUS_LABEL,
  STATUS_TONE,
  TIER_LABEL,
  TIER_TONE,
  formatApprovedExchanges,
} from "@/lib/admin/display";
import type { AdminUserListItem } from "@/types/admin";

const PAGE_SIZE = 20;

export function UserListClient() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await adminFetch<{ users: AdminUserListItem[] }>(
        "/api/admin/users"
      );
      if (!active) return;
      if (!res.ok || !res.data) {
        setError(res.message ?? "회원 목록을 불러오지 못했습니다. 다시 시도해 주세요.");
        return;
      }
      setUsers(res.data.users);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return <p className="text-sm text-down">{error}</p>;
  }

  if (users === null) {
    return <p className="text-sm text-muted">불러오는 중…</p>;
  }

  if (users.length === 0) {
    return <p className="text-sm text-muted">가입한 회원이 없습니다.</p>;
  }

  const totalPages = Math.ceil(users.length / PAGE_SIZE);
  const pageUsers = users.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left text-xs text-muted">
              <th className="px-4 py-3 font-medium">이메일</th>
              <th className="px-4 py-3 font-medium">회원등급</th>
              <th className="px-4 py-3 font-medium">거래소</th>
              <th className="px-4 py-3 font-medium">가입일</th>
              <th className="px-4 py-3 font-medium">상태</th>
            </tr>
          </thead>
          <tbody>
            {pageUsers.map((u) => (
              <tr
                key={u.userId}
                onClick={() => router.push(`${ADMIN_BASE_PATH}/users/${u.userId}`)}
                className="cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-surface-hover"
              >
                <td className="px-4 py-3 text-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge tone={TIER_TONE[u.membershipTier]}>
                    {TIER_LABEL[u.membershipTier]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted">
                  {formatApprovedExchanges(u.approvedExchanges)}
                </td>
                <td className="px-4 py-3 text-muted">
                  {formatRegisteredTime(u.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONE[u.status]}>
                    {STATUS_LABEL[u.status]}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
