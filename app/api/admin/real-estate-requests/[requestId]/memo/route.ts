import { NextRequest, NextResponse } from "next/server";
import { proxyAuthed } from "@/lib/admin/proxy";
import { MEMO_MAX_LENGTH } from "@/lib/admin/constants";
import type { AdminMutationResult } from "@/types/admin";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/real-estate-requests/{requestId}/memo  { memo }
 * Single-field overwrite memo (≤1000 chars, empty allowed). Mirrors the user
 * memo pattern; forwards to the backend.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  let body: { memo?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "잘못된 요청입니다." },
      { status: 400 }
    );
  }

  const memo = body.memo;
  if (typeof memo !== "string") {
    return NextResponse.json(
      { success: false, message: "메모 형식이 올바르지 않습니다." },
      { status: 400 }
    );
  }
  if (memo.length > MEMO_MAX_LENGTH) {
    return NextResponse.json(
      { success: false, message: `메모는 최대 ${MEMO_MAX_LENGTH}자까지 가능합니다.` },
      { status: 400 }
    );
  }

  return proxyAuthed<AdminMutationResult>({
    path: `/real-estate-requests/${encodeURIComponent(params.requestId)}/memo`,
    method: "PATCH",
    body: { memo },
  });
}
