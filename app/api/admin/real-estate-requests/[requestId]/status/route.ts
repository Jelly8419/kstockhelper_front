import { NextRequest, NextResponse } from "next/server";
import { proxyAuthed } from "@/lib/admin/proxy";
import type {
  AdminMutationResult,
  RealEstateRequestStatus,
} from "@/types/admin";

export const dynamic = "force-dynamic";

/** Only the two PRD statuses are accepted (접수 / 답변완료). */
const STATUSES: RealEstateRequestStatus[] = ["RECEIVED", "ANSWERED"];

/**
 * PATCH /api/admin/real-estate-requests/{requestId}/status  { status }
 * Forwards to the backend; mirrors premium-applications status pattern.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  let body: { status?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "잘못된 요청입니다." },
      { status: 400 }
    );
  }

  const status = body.status;
  if (
    typeof status !== "string" ||
    !STATUSES.includes(status as RealEstateRequestStatus)
  ) {
    return NextResponse.json(
      { success: false, message: "status는 RECEIVED 또는 ANSWERED여야 합니다." },
      { status: 400 }
    );
  }

  return proxyAuthed<AdminMutationResult>({
    path: `/real-estate-requests/${encodeURIComponent(params.requestId)}/status`,
    method: "PATCH",
    body: { status },
  });
}
