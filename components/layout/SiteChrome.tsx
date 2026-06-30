"use client";

import type { ReactNode } from "react";
import { usePathname } from "@/lib/i18n/navigation";
import { REAL_ESTATE_HOME_PATH } from "@/lib/constants/realEstate";

/**
 * Chooses the page chrome by path on the client (usePathname → exact regardless
 * of static rendering):
 *  - Real Estate pages (home + request) → light theme scope + dedicated GNB, no
 *    footer (k-property revisions §3-§4);
 *  - everything else → default dark Gnb + Footer.
 *
 * The chrome pieces are passed in as already-rendered slots (not imported here),
 * so async Server Components like Footer render on the server and this client
 * wrapper only decides which slot to show. `usePathname()` returns the
 * locale-stripped path, so REAL_ESTATE_HOME_PATH matches the home + `/request`.
 */
export function SiteChrome({
  gnb,
  footer,
  realEstateGnb,
  children,
}: {
  gnb: ReactNode;
  footer: ReactNode;
  realEstateGnb: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isRealEstate = pathname.startsWith(REAL_ESTATE_HOME_PATH);

  if (isRealEstate) {
    return (
      <div className="theme-realestate-light flex min-h-screen flex-col bg-background text-foreground">
        {realEstateGnb}
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <>
      {gnb}
      <main className="flex-1">{children}</main>
      {footer}
    </>
  );
}
