import { NextRequest } from "next/server";
import { proxyAuthed } from "@/lib/admin/proxy";
import type { AnalyticsFunnelResponse } from "@/types/adminAnalytics";

export const dynamic = "force-dynamic";

/** GET /api/admin/analytics/funnel — conversion funnel (daily; ?mode=total for sum). */
export async function GET(request: NextRequest) {
  return proxyAuthed<AnalyticsFunnelResponse>({
    path: `/analytics/funnel${request.nextUrl.search}`,
  });
}
