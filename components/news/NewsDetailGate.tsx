"use client";

import Link from "next/link";
import { NewsDetailItem } from "@/types/news";
import { useAuth } from "@/lib/hooks/useAuth";
import { NewsDetail } from "./NewsDetail";
import { Button } from "@/components/ui/Button";

/**
 * Route-level access guard for news detail (covers direct URL access).
 * - member → full detail
 * - guest  → "Sign up to read" panel
 *
 * Defense in depth: even for a member, if the DB returned no body (gated),
 * we fall back to the sign-up panel instead of an empty page.
 */
export function NewsDetailGate({ item }: { item: NewsDetailItem }) {
  const { tier, isLoading } = useAuth();

  if (isLoading) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  const hasContent = item.summary != null || item.body != null;

  if (tier === "member" && hasContent) {
    return <NewsDetail item={item} />;
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface px-6 py-16 text-center">
      <h1 className="text-xl font-semibold text-foreground">Sign up to read</h1>
      <p className="max-w-sm text-sm text-muted">
        Create a free account to read full news and disclosures.
      </p>
      <Link href="/signup">
        <Button>Sign Up</Button>
      </Link>
    </div>
  );
}
