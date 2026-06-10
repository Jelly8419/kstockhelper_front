"use client";

import Link from "next/link";
import { NewsDetailItem } from "@/types/news";
import { useAuth } from "@/lib/hooks/useAuth";
import { NewsDetail } from "./NewsDetail";
import { Button } from "@/components/ui/Button";

/**
 * Route-level access guard for news detail (covers direct URL access).
 * - premium → full detail
 * - free    → connect-UID panel
 * - guest   → sign-up panel
 *
 * Defense in depth: if the DB returned no body (gated), fall back to a gate
 * panel instead of an empty page.
 */
export function NewsDetailGate({ item }: { item: NewsDetailItem }) {
  const { tier, isLoading } = useAuth();

  if (isLoading) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  const hasContent = item.summary != null || item.body != null;
  if (tier === "premium" && hasContent) {
    return <NewsDetail item={item} />;
  }

  // Guest → sign up first.
  if (tier === "guest") {
    return (
      <Panel title="Sign up to read" description="Create a free account to read full news and disclosures.">
        <Link href="/signup">
          <Button>Sign Up</Button>
        </Link>
      </Panel>
    );
  }

  // Free → connect UID to unlock premium.
  return (
    <Panel
      title="Unlock Premium Access"
      description="Connect your UID to get full access to all news & disclosures."
    >
      <Link href="/settings">
        <Button>Connect Your UID</Button>
      </Link>
    </Panel>
  );
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface px-6 py-16 text-center">
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      <p className="max-w-sm text-sm text-muted">{description}</p>
      {children}
    </div>
  );
}
