import { NextRequest } from "next/server";
import { proxyAuthed } from "@/lib/admin/proxy";
import type { AnalyticsEventsResponse } from "@/types/adminAnalytics";

export const dynamic = "force-dynamic";

/** GET /api/admin/analytics/events — per-event daily counts (?eventName= to filter). */
export async function GET(request: NextRequest) {
  return proxyAuthed<AnalyticsEventsResponse>({
    path: `/analytics/events${request.nextUrl.search}`,
  });
}
