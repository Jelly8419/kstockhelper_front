"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin/client";
import { Button } from "@/components/ui/Button";
import type { FeatureFlags } from "@/lib/featureFlags/flags";

/**
 * Admin toggle for the Price Gap public-visibility flag.
 *
 * OFF (default) = Price Gap is visible to whitelisted internal IPs only;
 * ON = visible to everyone. Reads the current state on mount and PATCHes on
 * toggle. (Admin console renders outside the next-intl provider, so copy is
 * Korean inline — same as the other admin screens.)
 */
export function FeatureFlagsClient() {
  const [priceGapPublic, setPriceGapPublic] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    adminFetch<FeatureFlags>("/api/admin/feature-flags").then((r) => {
      if (!active) return;
      if (r.ok && r.data) setPriceGapPublic(r.data.priceGapPublic);
      else setError(r.message ?? "현재 상태를 불러오지 못했습니다.");
    });
    return () => {
      active = false;
    };
  }, []);

  const toggle = async (next: boolean) => {
    setSaving(true);
    setError(null);
    const r = await adminFetch<FeatureFlags>("/api/admin/feature-flags", {
      method: "PATCH",
      body: { priceGapPublic: next },
    });
    if (r.ok && r.data) setPriceGapPublic(r.data.priceGapPublic);
    else setError(r.message ?? "변경에 실패했습니다.");
    setSaving(false);
  };

  if (priceGapPublic === null && !error) {
    return <p className="text-sm text-muted">불러오는 중…</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4">
        <div className="flex flex-col gap-1">
          <span className="font-medium text-foreground">Price Gap Monitor 전체 공개</span>
          <span className="text-sm text-muted">
            끄면 화이트리스트 IP(개발/PM)에게만 노출, 켜면 전체 공개됩니다.
          </span>
          <span className="text-sm">
            현재 상태:{" "}
            <strong className={priceGapPublic ? "text-up" : "text-muted"}>
              {priceGapPublic ? "전체 공개 (ON)" : "내부 전용 (OFF)"}
            </strong>
          </span>
        </div>
        <Button
          variant={priceGapPublic ? "secondary" : "primary"}
          onClick={() => toggle(!priceGapPublic)}
          disabled={saving || priceGapPublic === null}
        >
          {saving ? "저장 중…" : priceGapPublic ? "전체 공개 끄기" : "전체 공개 켜기"}
        </Button>
      </div>

      {error && <p className="text-sm text-down">{error}</p>}

      <p className="text-xs text-muted">
        변경은 공개 캐시(30초) 때문에 최대 30초 후 반영될 수 있습니다.
      </p>
    </div>
  );
}
