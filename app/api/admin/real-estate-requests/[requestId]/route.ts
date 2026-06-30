import { NextRequest } from "next/server";
import { proxyAuthed } from "@/lib/admin/proxy";
import type { RealEstateRequestDetail } from "@/types/admin";

export const dynamic = "force-dynamic";

/** GET /api/admin/real-estate-requests/{requestId} — full request detail. */
export async function GET(
  _request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  return proxyAuthed<RealEstateRequestDetail>({
    path: `/real-estate-requests/${encodeURIComponent(params.requestId)}`,
  });
}
