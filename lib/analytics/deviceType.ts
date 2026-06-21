import type { DeviceType } from "./types";

/**
 * Classify the current device as desktop / mobile / tablet.
 *
 * UA-first with a screen-width fallback (no ua-parser-js dependency — overkill
 * for MVP). Tablet is checked before mobile because tablet UAs often also match
 * mobile keywords; iPadOS 13+ masquerades as desktop Safari, so we additionally
 * detect it via touch points on a Macintosh UA. SSR-safe (returns 'desktop'
 * when navigator is unavailable).
 */
export function getDeviceType(): DeviceType {
  if (typeof navigator === "undefined") return "desktop";

  const ua = navigator.userAgent;

  // Tablet first (iPad/Android tablet without the "Mobile" token).
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) {
    return "tablet";
  }
  // iPadOS 13+ reports a desktop (Macintosh) UA → disambiguate via touch.
  if (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua)) {
    return "tablet";
  }
  // Phones.
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) {
    return "mobile";
  }
  // Width fallback (Tailwind `md` breakpoint) when the UA is inconclusive.
  if (typeof window !== "undefined" && window.innerWidth < 768) {
    return "mobile";
  }
  return "desktop";
}
