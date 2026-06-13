import { NextRequest, NextResponse } from "next/server";
import { proxyAuthed } from "@/lib/admin/proxy";
import { validateStatusChange } from "@/lib/admin/hotNewsValidation";
import type { AdminMutationResult } from "@/types/admin";
import type { HotNewsDetail } from "@/types/hotNews";

export const dynamic = "force-dynamic";

/** GET /api/admin/hot-news/{id} — single item incl. Korean body (view-only). */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyAuthed<HotNewsDetail>({
    path: `/hot-news/${encodeURIComponent(params.id)}`,
  });
}

/**
 * PATCH /api/admin/hot-news/{id} — status transition only.
 * Content is NOT editable; only { status, scheduledAt } are forwarded.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let body: { status?: unknown; scheduledAt?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "잘못된 요청입니다." },
      { status: 400 }
    );
  }

  const error = validateStatusChange(body);
  if (error) {
    return NextResponse.json({ success: false, message: error }, { status: 400 });
  }

  return proxyAuthed<AdminMutationResult>({
    path: `/hot-news/${encodeURIComponent(params.id)}`,
    method: "PATCH",
    body: { status: body.status, scheduledAt: body.scheduledAt ?? null },
  });
}

/** DELETE /api/admin/hot-news/{id} — hard delete (translations cascade). */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyAuthed<AdminMutationResult>({
    path: `/hot-news/${encodeURIComponent(params.id)}`,
    method: "DELETE",
  });
}
