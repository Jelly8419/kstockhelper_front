"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { PriceGapMonitor } from "./PriceGapMonitor";

/**
 * Access guard for Price Gap Monitor. All three tiers now see the monitor;
 * the only gate is the loading state.
 *
 *  - guest:    10-min delayed monitor (polls tier=basic). Delay banner is
 *              guest-worded and the locked PIP prompts login (not upgrade).
 *  - free:     10-min delayed monitor (polls tier=basic), PIP locked → upgrade.
 *  - premium:  realtime monitor (polls tier=premium).
 *
 * Region no longer gates access: restricted-country users may use the monitor
 * too. The delay/PIP differences (including guest vs free CTAs) are handled
 * inside the monitor by `tier`.
 */
export function PriceGapGate() {
  const { tier, isLoading } = useAuth();
  const { t } = useTranslation();

  if (isLoading) {
    return <p className="text-sm text-muted">{t("common.loading")}</p>;
  }

  return <PriceGapMonitor tier={tier} />;
}
