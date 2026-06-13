"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin/client";
import { ADMIN_BASE_PATH } from "@/lib/admin/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TICKER_LABEL } from "@/lib/constants/tickers";
import {
  HOT_NEWS_STATUSES,
  HOT_NEWS_STATUS_LABEL,
  RELATED_STOCK_OPTIONS,
} from "@/lib/constants/hotNews";
import { validateCreate } from "@/lib/admin/hotNewsValidation";
import type {
  HotNewsCreateResult,
  HotNewsStatus,
  RelatedStock,
} from "@/types/hotNews";

/**
 * Hot in Korea registration form (Korean input). No edit form exists — content
 * is immutable after creation (only status changes + delete). Backend turns the
 * Korean original into an English brief + 5-locale translations on save.
 *
 * `scheduledAt` uses a `datetime-local` input (local wall-clock); we convert to
 * an ISO string before sending so the backend judges against its server clock.
 */
export function HotNewsCreateForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [stocks, setStocks] = useState<RelatedStock[]>([]);
  const [status, setStatus] = useState<HotNewsStatus>("published");
  const [scheduledLocal, setScheduledLocal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleStock = (s: RelatedStock) => {
    setError(null);
    setStocks((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSubmit = async () => {
    // datetime-local → ISO (only when scheduled). Empty string → null.
    const scheduledAt =
      status === "scheduled" && scheduledLocal
        ? new Date(scheduledLocal).toISOString()
        : null;

    const payload = {
      title: title.trim(),
      content: content.trim(),
      relatedStock: stocks,
      status,
      scheduledAt,
    };

    const validationError = validateCreate(payload);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);
    const res = await adminFetch<HotNewsCreateResult>("/api/admin/hot-news", {
      method: "POST",
      body: payload,
    });
    setSubmitting(false);

    if (!res.ok) {
      setError(res.message ?? "뉴스를 저장하지 못했습니다. 다시 시도해 주세요.");
      return;
    }
    router.push(`${ADMIN_BASE_PATH}/hot-news`);
  };

  const fieldClass =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-brand";

  return (
    <div className="flex max-w-2xl flex-col gap-5 rounded-2xl border border-border bg-surface p-6">
      <Field label="제목" required>
        <Input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError(null);
          }}
          placeholder="한국어 뉴스 제목을 입력하세요."
        />
      </Field>

      <Field label="내용" required>
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setError(null);
          }}
          rows={8}
          placeholder="한국어 뉴스 본문을 입력하세요. (영문 가공·번역은 자동 처리됩니다)"
          className={`${fieldClass} resize-y`}
        />
      </Field>

      <Field label="관련 종목" required>
        <div className="flex flex-wrap gap-2">
          {RELATED_STOCK_OPTIONS.map((s) => {
            const active = stocks.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleStock(s)}
                className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                  active
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border bg-background text-muted hover:bg-surface-hover"
                }`}
              >
                {TICKER_LABEL[s]}
              </button>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-muted">중복 선택 가능 (1개 이상 필수)</p>
      </Field>

      <Field label="게시 상태" required>
        <div className="flex gap-2">
          {HOT_NEWS_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatus(s);
                setError(null);
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
      </Field>

      {status === "scheduled" && (
        <Field label="예약 게시 일시" required>
          <input
            type="datetime-local"
            value={scheduledLocal}
            onChange={(e) => {
              setScheduledLocal(e.target.value);
              setError(null);
            }}
            className={fieldClass}
          />
        </Field>
      )}

      {error && <p className="text-sm text-down">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button
          variant="secondary"
          onClick={() => router.push(`${ADMIN_BASE_PATH}/hot-news`)}
          disabled={submitting}
        >
          취소
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "저장 중…" : "저장"}
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-1 text-down">*</span>}
      </label>
      {children}
    </div>
  );
}
