import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation APIs. Drop-in replacements for `next/link` and
 * `next/navigation` that automatically keep the active locale in the URL, so a
 * `<Link href="/settings">` from `/vi/...` goes to `/vi/settings`.
 *
 * Use these everywhere in user-facing UI instead of the Next.js originals.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
