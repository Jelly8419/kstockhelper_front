import { NextResponse } from "next/server";
import { clearAdminToken } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

/** POST /api/admin/auth/logout — clears the admin session cookie. */
export async function POST() {
  clearAdminToken();
  return NextResponse.json({ success: true }, { status: 200 });
}
