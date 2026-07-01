"use client";

import { useEffect } from "react";

/**
 * Minimal bottom-of-screen toast for the Real Estate contact flow (copy-ID
 * feedback). Renders nothing when `message` is null; otherwise shows the text
 * for `duration` ms then calls `onDone` to clear it. Fixed + centered so it
 * floats above page content regardless of scroll.
 */
export function Toast({
  message,
  onDone,
  duration = 2000,
}: {
  message: string | null;
  onDone: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(onDone, duration);
    return () => window.clearTimeout(id);
  }, [message, duration, onDone]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4"
    >
      <div className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg">
        {message}
      </div>
    </div>
  );
}
