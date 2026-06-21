import { createClient } from "@/lib/supabase/client";
import type { EventRow } from "./types";

/**
 * Low-level event insert. Fire-and-forget: the promise is never awaited by
 * callers and any failure is swallowed, so analytics can never block or break
 * the UI. The browser supabase client is a cached singleton, so calling
 * createClient() per event is cheap.
 *
 * Use the `useTrackEvent` hook in components instead of calling this directly —
 * it gathers the common properties for you. This exists as the single insertion
 * point both paths funnel through.
 */
export function logEvent(row: EventRow): void {
  try {
    const supabase = createClient();
    void supabase
      .from("events")
      .insert(row)
      .then(({ error }) => {
        if (error && process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.warn("[analytics] insert failed:", error.message);
        }
      });
  } catch {
    // Never let analytics throw into the caller.
  }
}
