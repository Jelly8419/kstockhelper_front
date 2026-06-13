import { NextRequest, NextResponse } from "next/server";
import { proxyAuthed } from "@/lib/admin/proxy";
import { validateCreate } from "@/lib/admin/hotNewsValidation";
import type {
  HotNewsCreateResult,
  HotNewsListItem,
} from "@/types/hotNews";

export const dynamic = "force-dynamic";

/** GET /api/admin/hot-news — all hot-news rows, newest-first (no body). */
export async function GET() {
  return proxyAuthed<{ items: HotNewsListItem[] }>({ path: "/hot-news" });
}

/**
 * POST /api/admin/hot-news — register a hot-news item (Korean title/content).
 * Backend then generates the English brief + pre-translates to 5 locales.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "잘못된 요청입니다." },
      { status: 400 }
    );
  }

  const error = validateCreate(body);
  if (error) {
    return NextResponse.json({ success: false, message: error }, { status: 400 });
  }

  return proxyAuthed<HotNewsCreateResult>({
    path: "/hot-news",
    method: "POST",
    body: {
      title: body.title,
      content: body.content,
      relatedStock: body.relatedStock,
      status: body.status,
      scheduledAt: body.scheduledAt ?? null,
    },
  });
}
