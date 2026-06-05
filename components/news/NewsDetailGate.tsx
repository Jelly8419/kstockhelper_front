"use client";

import Link from "next/link";
import { NewsItem } from "@/types/news";
import { useAuth } from "@/lib/hooks/useAuth";
import { NewsDetail } from "./NewsDetail";
import { Button } from "@/components/ui/Button";

/**
 * Route-level access guard for news detail.
 * Premium → full detail. Free / guest → blocked panel (covers direct URL access).
 * The card-click modal flow is handled separately on the list.
 */
export function NewsDetailGate({ item }: { item: NewsItem }) {
  const { tier, isLoading } = useAuth();

  if (isLoading) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  if (tier === "premium") {
    return <NewsDetail item={item} />;
  }

  const isGuest = tier === "guest";

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface px-6 py-16 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        {isGuest ? "Sign up to read" : "Upgrade to Premium"}
      </h1>
      <p className="max-w-sm text-sm text-muted">
        {isGuest
          ? "Create a free account to read full news and disclosures."
          : "This content is available to premium members. Connect your IBKR broker account to unlock full access."}
      </p>
      <Link href={isGuest ? "/signup" : "/guide"}>
        <Button>{isGuest ? "Sign Up" : "Get Started with IBKR"}</Button>
      </Link>
    </div>
  );
}
