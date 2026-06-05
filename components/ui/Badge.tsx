import { ReactNode } from "react";

type Tone = "neutral" | "up" | "down" | "brand";

const toneStyles: Record<Tone, string> = {
  neutral: "bg-surface-hover text-muted border border-border",
  up: "bg-up/10 text-up",
  down: "bg-down/10 text-down",
  brand: "bg-brand/10 text-brand",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${toneStyles[tone]}`}
    >
      {children}
    </span>
  );
}
