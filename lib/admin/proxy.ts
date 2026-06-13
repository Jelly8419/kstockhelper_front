/**
 * Shared helpers for authenticated admin proxy routes (app/api/admin/*).
 *
 * Each protected route reads the admin token from the HttpOnly cookie, calls
 * the backend, and converts a backend 401 into a cleared cookie + uniform
 * response so the client can redirect to login.
 */

import { NextResponse } from "next/server";
import { callAdminApi, type AdminApiResult } from "@/lib/admin/api";
import { clearAdminToken, getAdminToken } from "@/lib/admin/session";

const SESSION_EXPIRED = "세션이 만료되었습니다. 다시 로그인해 주세요.";

interface AuthedCall {
  path: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
}

/**
 * Run an authenticated backend call on behalf of the browser.
 *
 * Returns a NextResponse to send back. On a missing token or backend 401 it
 * clears the cookie and returns 401 with the standard "session expired"
 * message; the client treats 401 as "redirect to login".
 */
export async function proxyAuthed<T>({
  path,
  method = "GET",
  body,
}: AuthedCall): Promise<NextResponse> {
  const token = getAdminToken();
  if (!token) {
    return NextResponse.json(
      { success: false, message: SESSION_EXPIRED },
      { status: 401 }
    );
  }

  const result: AdminApiResult<T> = await callAdminApi<T>(path, {
    method,
    token,
    body,
  });

  if (result.unauthorized) {
    clearAdminToken();
    return NextResponse.json(
      { success: false, message: result.message ?? SESSION_EXPIRED },
      { status: 401 }
    );
  }

  if (!result.ok) {
    return NextResponse.json(
      { success: false, message: result.message ?? "요청을 처리하지 못했습니다." },
      { status: result.status }
    );
  }

  return NextResponse.json(result.data, { status: 200 });
}
