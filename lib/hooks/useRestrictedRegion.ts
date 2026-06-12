"use client";

import { useEffect, useState } from "react";
import { RESTRICTED_REGION_COOKIE } from "@/lib/geo/bannerGate";

/** Read a cookie value from `document.cookie`, or null if absent. */
function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

/**
 * Whether the visitor is in a restricted region, read from the
 * `x-restricted-region` cookie the middleware sets ("1" = restricted).
 *
 * The cookie is already present on the document when the page loads (the
 * middleware set it on the response), so the lazy initializer reads it on the
 * first client render — avoiding a flash of the non-restricted UI. The effect
 * re-syncs after hydration in case the cookie was written late.
 */
export function useRestrictedRegion(): boolean {
  const [restricted, setRestricted] = useState<boolean>(
    () => readCookie(RESTRICTED_REGION_COOKIE) === "1"
  );

  useEffect(() => {
    setRestricted(readCookie(RESTRICTED_REGION_COOKIE) === "1");
  }, []);

  return restricted;
}
