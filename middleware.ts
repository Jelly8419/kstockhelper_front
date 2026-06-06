import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { shouldShowBanner, SHOW_BANNER_HEADER } from "@/lib/geo/bannerGate";

export async function middleware(request: NextRequest) {
  // Geo-gate the banner: inject the decision as a request header so server
  // components can read it via headers().
  const showBanner = shouldShowBanner(request);
  request.headers.set(SHOW_BANNER_HEADER, showBanner ? "true" : "false");

  // Supabase session refresh (propagates the modified request headers).
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and image optimization.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
