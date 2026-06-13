"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin/client";
import { ADMIN_BASE_PATH } from "@/lib/admin/constants";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatRegisteredTime } from "@/lib/utils/format";
import { TICKER_LABEL } from "@/lib/constants/tickers";
import {
  HOT_NEWS_STATUSES,
  HOT_NEWS_STATUS_LABEL,
  HOT_NEWS_STATUS_TONE,
} from "@/lib/constants/hotNews";
import { validateStatusChange } from "@/lib/admin/hotNewsValidation";
import type { AdminMutationResult } from "@/types/admin";
import type {
  HotNewsListItem,
  HotNewsStatus,
} from "@/types/hotNews";

const DELETE_TITLE = "핫뉴스 삭제";
const DELETE_MESSAGE =
  "정말 이 뉴스를 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.";

export function HotNewsClient() {
  const router = useRouter();
  const [items, setItems] = useState<HotNewsListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Item awaiting a status change (null = closed).
  const [statusTarget, setStatusTarget] = useState<HotNewsListItem | null>(null);
  // Item awaiting delete confirmation (null = closed).
  const [deleteTarget, setDeleteTarget] = useState<HotNewsListItem | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(
    null
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await adminFetch<{ items: HotNewsListItem[] }>(
        "/api/admin/hot-news"
      );
      if (!active) return;
      if (!res.ok || !res.data) {
        setError(res.message ?? "핫뉴스 목록을 불러오지 못했습니다. 다시 시도해 주세요.");
        return;
      }
      // Newest-first (PRD) — sort defensively in case the backend doesn't.
      const sorted = [...res.data.items].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      );
      setItems(sorted);
    })();
    return () => {
      active = false;
    };
  }, []);

  const applyStatus = (updated: HotNewsListItem) => {
    setItems((prev) =>
      prev ? prev.map((i) => (i.id === updated.id ? updated : i)) : prev
    );
  };

  if (error) return <p className="text-sm text-down">{error}</p>;
  if (items === null) return <p className="text-sm text-muted">불러오는 중…</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => router.push(`${ADMIN_BASE_PATH}/hot-news/new`)}>
          뉴스 등록
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted">등록된 핫뉴스가 없습니다.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium">제목</th>
                <th className="px-4 py-3 font-medium">관련 종목</th>
                <th className="px-4 py-3 font-medium">상태</th>
                <th className="px-4 py-3 font-medium">예약 일시</th>
                <th className="px-4 py-3 font-medium">게시일</th>
                <th className="px-4 py-3 font-medium">등록일</th>
                <th className="px-4 py-3 font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border last:border-0 align-top"
                >
                  <td className="px-4 py-3 text-foreground">{item.title}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {item.relatedStock.map((s) => (
                        <Badge key={s} tone="brand">
                          {TICKER_LABEL[s]}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={HOT_NEWS_STATUS_TONE[item.status]}>
                      {HOT_NEWS_STATUS_LABEL[item.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {item.scheduledAt
                      ? formatRegisteredTime(item.scheduledAt)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {item.publishedAt
                      ? formatRegisteredTime(item.publishedAt)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {formatRegisteredTime(item.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setRowError(null);
                            setStatusTarget(item);
                          }}
                        >
                          상태 변경
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setRowError(null);
                            setDeleteTarget(item);
                          }}
                        >
                          삭제
                        </Button>
                      </div>
                      {rowError?.id === item.id && (
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
      )}

      <StatusModal
        item={statusTarget}
        onClose={() => setStatusTarget(null)}
        onApplied={applyStatus}
        onError={(id, message) => setRowError({ id, message })}
      />

      <DeleteModal
        item={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={(id) => {
          setItems((prev) => (prev ? prev.filter((i) => i.id !== id) : prev));
        }}
        onError={(id, message) => setRowError({ id, message })}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Status-change modal (status + scheduledAt when scheduled)          */
/* ------------------------------------------------------------------ */
function StatusModal({
  item,
  onClose,
  onApplied,
  onError,
}: {
  item: HotNewsListItem | null;
  onClose: () => void;
  onApplied: (updated: HotNewsListItem) => void;
  onError: (id: string, message: string) => void;
}) {
  const [status, setStatus] = useState<HotNewsStatus>("published");
  const [scheduledLocal, setScheduledLocal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Seed the modal from the item each time it opens.
  useEffect(() => {
    if (!item) return;
    setStatus(item.status);
    setScheduledLocal(toLocalInput(item.scheduledAt));
    setFormError(null);
  }, [item]);

  if (!item) return null;

  const handleApply = async () => {
    const scheduledAt =
      status === "scheduled" && scheduledLocal
        ? new Date(scheduledLocal).toISOString()
        : null;

    const validationError = validateStatusChange({ status, scheduledAt });
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSubmitting(true);
    setFormError(null);
    const res = await adminFetch<AdminMutationResult>(
      `/api/admin/hot-news/${encodeURIComponent(item.id)}`,
      { method: "PATCH", body: { status, scheduledAt } }
    );
    setSubmitting(false);

    if (!res.ok) {
      onError(item.id, res.message ?? "상태를 변경하지 못했습니다. 다시 시도해 주세요.");
      onClose();
      return;
    }
    onApplied({ ...item, status, scheduledAt });
    onClose();
  };

  const fieldClass =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand";

  return (
    <Modal open={item !== null} onClose={() => !submitting && onClose()} title="상태 변경">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          {HOT_NEWS_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatus(s);
                setFormError(null);
              }}
              className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                status === s
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-background text-muted hover:bg-surface-hover"
              }`}
            >
              {HOT_NEWS_STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        {status === "scheduled" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              예약 게시 일시
            </label>
            <input
              type="datetime-local"
              value={scheduledLocal}
              onChange={(e) => {
                setScheduledLocal(e.target.value);
                setFormError(null);
              }}
              className={fieldClass}
            />
          </div>
        )}

        {formError && <p className="text-sm text-down">{formError}</p>}

        <p className="text-xs text-muted">
          내용 수정은 지원하지 않습니다. 내용을 고치려면 삭제 후 다시 등록해 주세요.
        </p>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            취소
          </Button>
          <Button onClick={handleApply} disabled={submitting}>
            {submitting ? "변경 중…" : "변경"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Delete confirmation modal (PRD 4.7)                                */
/* ------------------------------------------------------------------ */
function DeleteModal({
  item,
  onClose,
  onDeleted,
  onError,
}: {
  item: HotNewsListItem | null;
  onClose: () => void;
  onDeleted: (id: string) => void;
  onError: (id: string, message: string) => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  if (!item) return null;

  const handleDelete = async () => {
    setSubmitting(true);
    const res = await adminFetch<AdminMutationResult>(
      `/api/admin/hot-news/${encodeURIComponent(item.id)}`,
      { method: "DELETE" }
    );
    setSubmitting(false);

    if (!res.ok) {
      onError(item.id, res.message ?? "뉴스를 삭제하지 못했습니다. 다시 시도해 주세요.");
      onClose();
      return;
    }
    onDeleted(item.id);
    onClose();
  };

  return (
    <Modal open={item !== null} onClose={() => !submitting && onClose()} title={DELETE_TITLE}>
      <div className="flex flex-col gap-4">
        <p className="whitespace-pre-line text-sm text-muted">{DELETE_MESSAGE}</p>
        <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground">
          {item.title}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            취소
          </Button>
          <Button onClick={handleDelete} disabled={submitting}>
            {submitting ? "삭제 중…" : "삭제"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/** ISO timestamp → `datetime-local` value (local wall-clock), or "". */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}
