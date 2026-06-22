import { NextRequest } from "next/server";
import { proxyAuthed } from "@/lib/admin/proxy";
import type { AnalyticsRawResponse } from "@/types/adminAnalytics";

export const dynamic = "force-dynamic";

/** GET /api/admin/analytics/raw — raw events (from/to/eventNames/page/pageSize). */
export async function GET(request: NextRequest) {
  return proxyAuthed<AnalyticsRawResponse>({
    path: `/analytics/raw${request.nextUrl.search}`,
  });
}
