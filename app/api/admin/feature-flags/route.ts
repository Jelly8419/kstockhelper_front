import { NextRequest, NextResponse } from "next/server";
import { proxyAuthed } from "@/lib/admin/proxy";
import type { FeatureFlags } from "@/lib/featureFlags/flags";

export const dynamic = "force-dynamic";

/** GET /api/admin/feature-flags → current flag state for the admin console. */
export async function GET() {
  return proxyAuthed<{ data?: FeatureFlags } & FeatureFlags>({
    path: "/feature-flags",
    method: "GET",
  });
}

/** PATCH /api/admin/feature-flags { priceGapPublic: boolean } → toggle a flag. */
export async function PATCH(request: NextRequest) {
  let body: { priceGapPublic?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "잘못된 요청입니다." },
      { status: 400 }
    );
  }

  if (typeof body.priceGapPublic !== "boolean") {
    return NextResponse.json(
      { success: false, message: "priceGapPublic은 boolean이어야 합니다." },
      { status: 400 }
    );
  }

  return proxyAuthed<FeatureFlags>({
    path: "/feature-flags",
    method: "PATCH",
    body: { priceGapPublic: body.priceGapPublic },
  });
}
