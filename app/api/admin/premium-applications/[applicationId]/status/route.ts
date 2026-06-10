import { NextRequest, NextResponse } from "next/server";
import { proxyAuthed } from "@/lib/admin/proxy";
import type { AdminMutationResult, ApplicationStatus } from "@/types/admin";

export const dynamic = "force-dynamic";

/** Only APPROVED/REJECTED are valid actions (PENDING is read-only). */
const ACTIONS: ApplicationStatus[] = ["APPROVED", "REJECTED"];

/**
 * PATCH /api/admin/premium-applications/{applicationId}/status  { status }
 *
 * Forwards to the backend, which atomically updates the application, the user's
 * uid_status / tier, and the activity log — and uses a conditional update to
 * block double-processing (409). We pass the backend's status code and message
 * through unchanged so the client can show "이미 처리된 신청 건입니다." etc.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
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
    !ACTIONS.includes(status as ApplicationStatus)
  ) {
    return NextResponse.json(
      { success: false, message: "status는 APPROVED 또는 REJECTED여야 합니다." },
      { status: 400 }
    );
  }

  return proxyAuthed<AdminMutationResult>({
    path: `/premium-applications/${encodeURIComponent(params.applicationId)}/status`,
    method: "PATCH",
    body: { status },
  });
}
