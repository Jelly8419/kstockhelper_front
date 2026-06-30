"use client";

import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { REAL_ESTATE_HOME_PATH } from "@/lib/constants/realEstate";

/**
 * Dedicated GNB for the Real Estate pages (k-property revisions §4).
 *
 * Differs from the main site GNB:
 *  - brand wordmark reads "K-Property Helper" and links to the Real Estate home
 *    (not the stock home);
 *  - a "K-Stock Helper" menu item is the explicit way back to the stock service.
 *
 * Auth actions are intentionally omitted — the Real Estate flow is no-signup
 * (PRD), so only the brand, the back-to-stock link, and the locale switcher show.
 */
export function RealEstateGnb() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-container items-center justify-between px-4 sm:px-6">
        {/* Brand → Real Estate home */}
        <Link
          href={REAL_ESTATE_HOME_PATH}
          className="flex items-center gap-2"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white p-1">
            <Image
              src="/logo-k-symbol.png"
              alt="K-Property Helper"
              width={32}
              height={32}
              className="h-full w-full"
              priority
            />
          </span>
          {/* Brand name — not translated. */}
          <span className="text-base font-semibold tracking-tight text-foreground">
            {"K-Property Helper"}
          </span>
        </Link>

        {/* Back to stock service + language */}
        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            {/* Brand name — not translated. */}
            {"K-Stock Helper"}
          </Link>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
