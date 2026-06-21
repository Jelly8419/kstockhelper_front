"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRestrictedRegion } from "@/lib/hooks/useRestrictedRegion";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { readCountryCode, mapMembership } from "./context";
import { getDeviceType } from "./deviceType";
import { logEvent } from "./logEvent";
import type { EventName, EventProps } from "./types";

/**
 * Returns a `track(name, props)` function that logs an event with all common
 * properties attached automatically:
 *  - user_id          ← useAuth().userId (null for guests)
 *  - membership_status ← tier mapped (free → 'basic')
 *  - country_group    ← restricted-region cookie
 *  - country_code     ← x-country-code cookie (set by middleware)
 *  - page_path        ← current pathname
 *  - device_type      ← UA/width heuristic
 *  - properties.locale ← active locale, merged with any caller props
 *
 * The hooks (useAuth/useTranslation/useRestrictedRegion/usePathname) are read at
 * render time; values read at call time (country_code, device_type) are read
 * inside track(). Insert is fire-and-forget.
 */
export function useTrackEvent(): (name: EventName, props?: EventProps) => void {
  const { tier, userId } = useAuth();
  const restricted = useRestrictedRegion();
  const { locale } = useTranslation();
  const pathname = usePathname();

  return useCallback(
    (name: EventName, props?: EventProps) => {
      logEvent({
        event_name: name,
        user_id: userId,
        country_code: readCountryCode(),
        country_group: restricted ? "restricted" : "allowed",
        membership_status: mapMembership(tier),
        device_type: getDeviceType(),
        page_path: pathname,
        properties: { locale, ...(props ?? {}) },
      });
    },
    [tier, userId, restricted, locale, pathname]
  );
}
