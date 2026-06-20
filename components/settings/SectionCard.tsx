import { ReactNode } from "react";

/**
 * Settings/MyPage section card: titled rounded panel with an optional badge in
 * the header. Shared by the exchange-connection sections and the subscription
 * status card.
 */
export function SectionCard({
  title,
  badge,
  children,
}: {
  title: string;
  badge: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {badge}
      </div>
      {children}
    </section>
  );
}
