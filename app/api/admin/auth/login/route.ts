import { NextRequest, NextResponse } from "next/server";
import { callAdminApi } from "@/lib/admin/api";
import { setAdminToken } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/auth/login  { adminId, password }
 *
 * Proxies to the backend admin login. On success, stores the returned
 * accessToken in an HttpOnly cookie and returns { success: true }. The token
 * itself never reaches the browser.
 */
export async function POST(request: NextRequest) {
  let body: { adminId?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "잘못된 요청입니다." },
      { status: 400 }
    );
  }

  const adminId = typeof body.adminId === "string" ? body.adminId.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!adminId || !password) {
    return NextResponse.json(
      { success: false, message: "아이디와 비밀번호를 입력해 주세요." },
      { status: 400 }
    );
  }

  const result = await callAdminApi<{ accessToken: string }>("/auth/login", {
    method: "POST",
    body: { adminId, password },
  });

  if (!result.ok || !result.data?.accessToken) {
    return NextResponse.json(
      {
        success: false,
        message: result.message ?? "아이디 또는 비밀번호가 올바르지 않습니다.",
      },
      { status: result.status === 200 ? 401 : result.status }
    );
  }

  setAdminToken(result.data.accessToken);
  return NextResponse.json({ success: true }, { status: 200 });
}
