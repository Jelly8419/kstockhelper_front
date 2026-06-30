"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatRegisteredTime } from "@/lib/utils/format";
import { MEMO_MAX_LENGTH } from "@/lib/admin/constants";
import {
  RE_STATUS_LABEL,
  RE_STATUS_TONE,
  RE_PROPERTY_TYPE_LABEL,
  formatBudgetRange,
  formatInKorea,
} from "@/lib/admin/display";
import type {
  AdminMutationResult,
  RealEstateRequestDetail,
  RealEstateRequestStatus,
} from "@/types/admin";

const STATUSES: RealEstateRequestStatus[] = ["RECEIVED", "ANSWERED"];

/**
 * Real Estate purchase request detail (Admin PRD §7-§8): full submitted values +
 * status change (dropdown + save) + single-field admin memo. Email and message
 * are shown in full (no masking, PRD §9) — the admin auth gate restricts access.
 */
export function RealEstateRequestDetailClient({
  requestId,
}: {
  requestId: string;
}) {
  const [data, setData] = useState<RealEstateRequestDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await adminFetch<RealEstateRequestDetail>(
      `/api/admin/real-estate-requests/${encodeURIComponent(requestId)}`
    );
    if (!res.ok || !res.data) {
      setError(res.message ?? "요청 정보를 불러오지 못했습니다. 다시 시도해 주세요.");
      return;
    }
    setError(null);
    setData(res.data);
  }, [requestId]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="text-sm text-down">{error}</p>;
  if (!data) return <p className="text-sm text-muted">불러오는 중…</p>;

  return (
    <div className="flex flex-col gap-6">
      <BasicInfo data={data} />
      <MessageBlock message={data.message} />
      <StatusChange
        requestId={requestId}
        current={data.status}
        onChanged={load}
      />
      <MemoEditor requestId={requestId} initialMemo={data.adminMemo ?? ""} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Basic info                                                         */
/* ------------------------------------------------------------------ */
function BasicInfo({ data }: { data: RealEstateRequestDetail }) {
  return (
    <Section title="기본 정보">
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        <Field label="요청일" value={formatRegisteredTime(data.createdAt)} />
        <Field label="이메일" value={data.email} />
        <Field label="거주 국가" value={data.countryOfResidence} />
        <Field
          label="예산 범위"
          value={formatBudgetRange(
            data.budgetCurrency,
            data.budgetMin,
            data.budgetMax
          )}
        />
        <Field
          label="부동산 유형"
          value={RE_PROPERTY_TYPE_LABEL[data.propertyType]}
        />
        <Field
          label="한국 체류 여부"
          value={formatInKorea(data.currentlyInKorea)}
        />
        <Field
          label="상태"
          value={
            <Badge tone={RE_STATUS_TONE[data.status]}>
              {RE_STATUS_LABEL[data.status]}
            </Badge>
          }
        />
      </dl>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Message (full, no masking — PRD 9)                                 */
/* ------------------------------------------------------------------ */
function MessageBlock({ message }: { message: string }) {
  return (
    <Section title="메시지">
      <p className="whitespace-pre-wrap text-sm text-foreground">{message}</p>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Status change (dropdown + save — PRD 8.1, 13)                      */
/* ------------------------------------------------------------------ */
function StatusChange({
  requestId,
  current,
  onChanged,
}: {
  requestId: string;
  current: RealEstateRequestStatus;
  onChanged: () => Promise<void>;
}) {
  const [selected, setSelected] = useState<RealEstateRequestStatus>(current);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setSelected(current);
  }, [current]);

  const unchanged = selected === current;

  const handleSave = async () => {
    if (unchanged) return;
    setSubmitting(true);
    setFeedback(null);
    const res = await adminFetch<AdminMutationResult>(
      `/api/admin/real-estate-requests/${encodeURIComponent(requestId)}/status`,
      { method: "PATCH", body: { status: selected } }
    );
    setSubmitting(false);

    if (!res.ok) {
      setIsError(true);
      setFeedback(res.message ?? "상태 저장에 실패했습니다. 다시 시도해주세요.");
      return;
    }
    setIsError(false);
    setFeedback(res.data?.message ?? "상태가 저장되었습니다.");
    await onChanged();
  };

  return (
    <Section title="상태">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value as RealEstateRequestStatus);
            setFeedback(null);
          }}
          className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors focus:border-brand"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {RE_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <Button onClick={handleSave} disabled={unchanged || submitting}>
          {submitting ? "저장 중…" : "상태 저장"}
        </Button>
      </div>
      {feedback && (
        <p className={`mt-2 text-xs ${isError ? "text-down" : "text-up"}`}>
          {feedback}
        </p>
      )}
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Admin memo (single field, overwrite — PRD 8.2)                     */
/* ------------------------------------------------------------------ */
function MemoEditor({
  requestId,
  initialMemo,
}: {
  requestId: string;
  initialMemo: string;
}) {
  const [memo, setMemo] = useState(initialMemo);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const dirty = memo !== initialMemo;

  const handleSave = async () => {
    setSubmitting(true);
    setFeedback(null);
    const res = await adminFetch<AdminMutationResult>(
      `/api/admin/real-estate-requests/${encodeURIComponent(requestId)}/memo`,
      { method: "PATCH", body: { memo } }
    );
    setSubmitting(false);

    if (!res.ok) {
      setIsError(true);
      setFeedback(res.message ?? "메모 저장에 실패했습니다. 다시 시도해주세요.");
      return;
    }
    setIsError(false);
    setFeedback(res.data?.message ?? "메모가 저장되었습니다.");
  };

  return (
    <Section title="관리자 메모">
      <textarea
        value={memo}
        onChange={(e) => {
          setMemo(e.target.value);
          setFeedback(null);
        }}
        maxLength={MEMO_MAX_LENGTH}
        rows={4}
        placeholder="요청 처리 메모를 입력하세요."
        className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-brand"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted">
          {memo.length} / {MEMO_MAX_LENGTH}
        </span>
        <Button onClick={handleSave} disabled={submitting || !dirty}>
          {submitting ? "저장 중…" : "메모 저장"}
        </Button>
      </div>
      {feedback && (
        <p className={`mt-1 text-xs ${isError ? "text-down" : "text-up"}`}>
          {feedback}
        </p>
      )}
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Shared layout bits                                                 */
/* ------------------------------------------------------------------ */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}
