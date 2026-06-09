"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatRegisteredTime } from "@/lib/utils/format";
import {
  EXCHANGE_LABEL,
  STATUS_LABEL,
  STATUS_TONE,
  TIER_LABEL,
  TIER_TONE,
  UID_STATUS_LABEL,
  UID_STATUS_TONE,
  describeActivityLog,
} from "@/lib/admin/display";
import { MEMO_MAX_LENGTH } from "@/lib/admin/constants";
import type {
  AdminMutationResult,
  AdminUserDetail,
  MembershipTier,
} from "@/types/admin";

export function UserDetailClient({ userId }: { userId: string }) {
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await adminFetch<AdminUserDetail>(
      `/api/admin/users/${encodeURIComponent(userId)}`
    );
    if (!res.ok || !res.data) {
      setError(res.message ?? "회원 정보를 불러오지 못했습니다. 다시 시도해 주세요.");
      return;
    }
    setError(null);
    setUser(res.data);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="text-sm text-down">{error}</p>;
  if (!user) return <p className="text-sm text-muted">불러오는 중…</p>;

  return (
    <div className="flex flex-col gap-6">
      <BasicInfo user={user} />
      <ExchangeUids user={user} />
      <TierChange user={user} onChanged={load} />
      <ActivityLogList user={user} />
      <MemoEditor userId={userId} initialMemo={user.adminMemo ?? ""} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Basic info                                                         */
/* ------------------------------------------------------------------ */
function BasicInfo({ user }: { user: AdminUserDetail }) {
  return (
    <Section title="회원 정보">
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        <Field label="이메일" value={user.email} />
        <Field label="가입일" value={formatRegisteredTime(user.createdAt)} />
        <Field
          label="회원등급"
          value={
            <Badge tone={TIER_TONE[user.membershipTier]}>
              {TIER_LABEL[user.membershipTier]}
            </Badge>
          }
        />
        <Field
          label="회원 상태"
          value={
            <Badge tone={STATUS_TONE[user.status]}>
              {STATUS_LABEL[user.status]}
            </Badge>
          }
        />
      </dl>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Exchange UIDs (read-only — approve/reject lives elsewhere, PRD 4.3) */
/* ------------------------------------------------------------------ */
function ExchangeUids({ user }: { user: AdminUserDetail }) {
  return (
    <Section title="거래소 UID">
      <div className="flex flex-col gap-3">
        {user.exchangeUids.map((eu) => (
          <div
            key={eu.exchange}
            className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {EXCHANGE_LABEL[eu.exchange]}
              </span>
              <span className="text-xs text-muted">
                {eu.uid ? `UID ${eu.uid}` : "UID 미등록"}
              </span>
            </div>
            <Badge tone={UID_STATUS_TONE[eu.status]}>
              {UID_STATUS_LABEL[eu.status]}
            </Badge>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">
        UID 승인/거절은 프리미엄 회원 신청 관리에서만 처리됩니다.
      </p>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Membership tier change                                             */
/* ------------------------------------------------------------------ */
function TierChange({
  user,
  onChanged,
}: {
  user: AdminUserDetail;
  onChanged: () => Promise<void>;
}) {
  const [selected, setSelected] = useState<MembershipTier>(user.membershipTier);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  // Keep the selection in sync if the user reloads with a new tier.
  useEffect(() => {
    setSelected(user.membershipTier);
  }, [user.membershipTier]);

  // PRD 4.5: disable the change button when the selection equals the current tier.
  const unchanged = selected === user.membershipTier;

  const handleChange = async () => {
    if (unchanged) return;
    setSubmitting(true);
    setFeedback(null);
    const res = await adminFetch<AdminMutationResult>(
      `/api/admin/users/${encodeURIComponent(user.userId)}/membership-tier`,
      { method: "PATCH", body: { membershipTier: selected } }
    );
    setSubmitting(false);

    if (!res.ok) {
      setIsError(true);
      setFeedback(res.message ?? "회원등급을 변경하지 못했습니다. 다시 시도해 주세요.");
      return;
    }
    setIsError(false);
    setFeedback(res.data?.message ?? "회원등급이 변경되었습니다.");
    // Re-fetch so the activity log / tier badge reflect the change.
    await onChanged();
  };

  const tiers: MembershipTier[] = ["GENERAL", "PREMIUM"];

  return (
    <Section title="회원등급 변경">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {tiers.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelected(t)}
              className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                selected === t
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-surface text-muted hover:bg-surface-hover"
              }`}
            >
              {TIER_LABEL[t]}
            </button>
          ))}
        </div>
        <Button onClick={handleChange} disabled={unchanged || submitting}>
          {submitting ? "변경 중…" : "변경"}
        </Button>
      </div>
      {feedback && (
        <p className={`mt-2 text-xs ${isError ? "text-down" : "text-up"}`}>
          {feedback}
        </p>
      )}
      <p className="mt-2 text-xs text-muted">
        회원등급을 변경해도 거래소 UID 상태는 변경되지 않습니다.
      </p>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Unified activity log (newest-first, read-only — PRD 4.7)           */
/* ------------------------------------------------------------------ */
function ActivityLogList({ user }: { user: AdminUserDetail }) {
  return (
    <Section title="통합 활동 로그">
      {user.activityLogs.length === 0 ? (
        <p className="text-sm text-muted">활동 내역이 없습니다.</p>
      ) : (
        <ul className="flex flex-col">
          {user.activityLogs.map((log, i) => (
            <li
              key={`${log.createdAt}-${i}`}
              className="flex flex-col gap-0.5 border-b border-border py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <span className="text-sm text-foreground">
                {describeActivityLog(log)}
              </span>
              <span className="text-xs text-muted">
                {formatRegisteredTime(log.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Admin memo (≤1000 chars, empty allowed — PRD 4.10)                 */
/* ------------------------------------------------------------------ */
function MemoEditor({
  userId,
  initialMemo,
}: {
  userId: string;
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
      `/api/admin/users/${encodeURIComponent(userId)}/memo`,
      { method: "PATCH", body: { memo } }
    );
    setSubmitting(false);

    if (!res.ok) {
      setIsError(true);
      setFeedback(res.message ?? "관리자 메모를 저장하지 못했습니다. 다시 시도해 주세요.");
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
        placeholder="회원 운영 메모를 입력하세요."
        className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-brand"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted">
          {memo.length} / {MEMO_MAX_LENGTH}
        </span>
        <Button onClick={handleSave} disabled={submitting || !dirty}>
          {submitting ? "저장 중…" : "저장"}
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

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}
