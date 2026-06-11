"use client";

import { ReactNode, useId, useState } from "react";

interface AccordionProps {
  /** Header content shown next to the toggle arrow. */
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Cap the expanded content height and make it scroll (e.g. long legal text). */
  scrollMaxHeight?: string;
}

export function Accordion({
  title,
  children,
  defaultOpen = false,
  scrollMaxHeight,
}: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="rounded-lg border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground"
      >
        <span
          aria-hidden
          className={`inline-block text-muted transition-transform ${
            open ? "rotate-90" : ""
          }`}
        >
          {/* eslint-disable-next-line i18next/no-literal-string -- decorative caret */}
          {"▸"}
        </span>
        <span className="flex-1">{title}</span>
      </button>
      {open && (
        <div
          id={panelId}
          className="border-t border-border px-3 py-3"
          style={
            scrollMaxHeight
              ? { maxHeight: scrollMaxHeight, overflowY: "auto" }
              : undefined
          }
        >
          {children}
        </div>
      )}
    </div>
  );
}
