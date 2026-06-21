import { NextRequest } from "next/server";
import { proxyAuthed } from "@/lib/admin/proxy";
import type { AnalyticsDauResponse } from "@/types/adminAnalytics";

export const dynamic = "force-dynamic";

/** GET /api/admin/analytics/dau — daily active users + event volume. */
export async function GET(request: NextRequest) {
  return proxyAuthed<AnalyticsDauResponse>({
    path: `/analytics/dau${request.nextUrl.search}`,
  });
}
