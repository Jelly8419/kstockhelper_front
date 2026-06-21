"use client";

import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/lib/i18n/navigation";
import { useTrackEvent } from "./useTrackEvent";
import type { EventName, EventProps } from "./types";

type LinkProps = ComponentProps<typeof Link>;

/**
 * A locale-aware <Link> that logs an analytics event on click. Lets server
 * components (which can't use hooks) instrument a link by rendering this client
 * child in place of <Link>:
 *   <TrackedLink event="home_gap_banner_clicked" href="/price-gap">…</TrackedLink>
 *
 * Tracking is fire-and-forget and runs before navigation; it never blocks it.
 */
export function TrackedLink({
  event,
  eventProps,
  children,
  onClick,
  ...linkProps
}: {
  event: EventName;
  eventProps?: EventProps;
  children: ReactNode;
} & LinkProps) {
  const track = useTrackEvent();

  return (
    <Link
      {...linkProps}
      onClick={(e) => {
        track(event, eventProps);
        onClick?.(e);
      }}
    >
      {children}
    </Link>
  );
}
