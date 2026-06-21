"use client";

import { useEffect, useRef } from "react";
import { useTrackEvent } from "./useTrackEvent";
import type { EventName, EventProps } from "./types";

/**
 * Fires a single analytics event on mount and renders nothing. Drop into a
 * (server or client) page/component to log a "viewed" event:
 *   <PageView event="home_viewed" />
 *
 * A ref guard prevents the double-fire from React StrictMode's dev re-mount.
 */
export function PageView({
  event,
  props,
}: {
  event: EventName;
  props?: EventProps;
}): null {
  const track = useTrackEvent();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track(event, props);
    // Intentionally mount-only: re-running on prop changes would double-count.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
