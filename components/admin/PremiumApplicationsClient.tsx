"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin/client";
import { ADMIN_BASE_PATH } from "@/lib/admin/constants";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatRegisteredTime } from "@/lib/utils/format";
import { EXCHANGE_LABEL, TIER_LABEL, TIER_TONE } from "@/lib/admin/display";
import type {
  AdminMutationResult,
  PremiumApplication,
} from "@/types/admin";

/** The two actions the confirm modal can trigger (PRD 4.11). */
type Action = "APPROVED" | "REJECTED";

const ACTION_TITLE: Record<Action, string> = {
  APPROVED: "신청 승인",
  REJECTED: "신청 거절",
};

const ACTION_MESSAGE: Record<Action, string> = {
  APPROVED:
    "이 신청 건을 승인하시겠습니까?\n승인 시 회원등급이 프리미엄으로 변경됩니다.",
  REJECTED:
    "이 신청 건을 거절하시겠습니까?\n거절 후 해당 UID는 Rejected 상태로 변경됩니다.",
};

const ACTION_LABEL: Record<Action, string> = {
  APPROVED: "승인",
  REJECTED: "거절",
};

/** Fallback when the backend doesn't send a message with a 409. */
const CONFLICT_FALLBACK = "이미 처리된 신청 건입니다.";

export function PremiumApplicationsClient() {
  const router = useRouter();
  const [items, setItems] = useState<PremiumApplication[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The application + action currently awaiting confirmation (null = modal closed).
  const [pending, setPending] = useState<{
    application: PremiumApplication;
    action: Action;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Per-row error message shown inline after a failed processing attempt.
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(
    null
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await adminFetch<{ items: PremiumApplication[] }>(
        "/api/admin/premium-applications"
      );
      if (!active) return;
      if (!res.ok || !res.data) {
        setError(res.message ?? "신청 목록을 불러오지 못했습니다. 다시 시도해 주세요.");
        return;
      }
      // Oldest-first (PRD 4.6) — sort defensively in case the backend doesn't.
      const sorted = [...res.data.items].sort((a, b) =>
        a.appliedAt.localeCompare(b.appliedAt)
      );
      setItems(sorted);
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleConfirm = async () => {
    if (!pending) return;
    const { application, action } = pending;
    setSubmitting(true);
    setRowError(null);

    const res = await adminFetch<AdminMutationResult>(
      `/api/admin/premium-applications/${encodeURIComponent(
        application.applicationId
      )}/status`,
      { method: "PATCH", body: { status: action } }
    );

    setSubmitting(false);

    if (!res.ok) {
      // 409 covers both "already processed" and "inactive member"; the backend
      // message distinguishes them. Fall back to the generic conflict text.
      setRowError({
        id: application.applicationId,
        message: res.message ?? CONFLICT_FALLBACK,
      });
      setPending(null);
      return;
    }

    // Success — drop the processed row from the list immediately (PRD 3.2/3.3).
    setItems((prev) =>
      prev
        ? prev.filter((a) => a.applicationId !== application.applicationId)
        : prev
    );
    setPending(null);
  };

  if (error) {
    return <p className="text-sm text-down">{error}</p>;
  }

  if (items === null) {
    return <p className="text-sm text-muted">불러오는 중…</p>;
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted">처리할 신청 건이 없습니다.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left text-xs text-muted">
              <th className="px-4 py-3 font-medium">신청일시</th>
              <th className="px-4 py-3 font-medium">이메일</th>
              <th className="px-4 py-3 font-medium">거래소</th>
              <th className="px-4 py-3 font-medium">UID</th>
              <th className="px-4 py-3 font-medium">현재 회원등급</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">액션</th>
            </tr>
          </thead>
          <tbody>
            {items.map((app) => (
              <tr
                key={app.applicationId}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-3 text-muted">
                  {formatRegisteredTime(app.appliedAt)}
                </td>
                <td className="px-4 py-3 text-foreground">{app.email}</td>
                <td className="px-4 py-3 text-muted">
                  {EXCHANGE_LABEL[app.exchange]}
                </td>
                <td className="px-4 py-3 text-foreground">{app.uid}</td>
                <td className="px-4 py-3">
                  <Badge tone={TIER_TONE[app.membershipTier]}>
                    {TIER_LABEL[app.membershipTier]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone="neutral">대기</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          setPending({ application: app, action: "APPROVED" })
                        }
                      >
                        승인
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setPending({ application: app, action: "REJECTED" })
                        }
                      >
                        거절
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          router.push(`${ADMIN_BASE_PATH}/users/${app.userId}`)
                        }
                      >
                        회원 상세
                      </Button>
                    </div>
                    {rowError?.id === app.applicationId && (
                      <span className="text-xs text-down">
                        {rowError.message}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={pending !== null}
        onClose={() => {
          if (!submitting) setPending(null);
        }}
        title={pending ? ACTION_TITLE[pending.action] : undefined}
      >
        {pending && (
          <div className="flex flex-col gap-4">
            <p className="whitespace-pre-line text-sm text-muted">
              {ACTION_MESSAGE[pending.action]}
            </p>
            <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm">
              <p className="text-foreground">{pending.application.email}</p>
              <p className="text-xs text-muted">
                {EXCHANGE_LABEL[pending.application.exchange]} UID{" "}
                {pending.application.uid}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setPending(null)}
                disabled={submitting}
              >
                취소
              </Button>
              <Button onClick={handleConfirm} disabled={submitting}>
                {submitting
                  ? "처리 중…"
                  : `${ACTION_LABEL[pending.action]} 확인`}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
