"use client";

/**
 * Browser-side helper for calling our /api/admin/* proxy routes.
 *
 * On a 401 (session expired) it hard-redirects to the admin login page, so
 * callers don't each have to handle expiry. Other errors are returned as a
 * message for the caller to render.
 */

import { ADMIN_LOGIN_PATH } from "@/lib/admin/constants";

export interface ClientResult<T> {
  ok: boolean;
  data: T | null;
  message: string | null;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
}

export async function adminFetch<T>(
  path: string,
  { method = "GET", body }: RequestOptions = {}
): Promise<ClientResult<T>> {
  let res: Response;
  try {
    res = await fetch(path, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    return { ok: false, data: null, message: "네트워크 오류가 발생했습니다. 다시 시도해 주세요." };
  }

  if (res.status === 401) {
    // Session expired — bounce to login (the cookie is already cleared server-side).
    if (typeof window !== "undefined") {
      window.location.href = ADMIN_LOGIN_PATH;
    }
    return { ok: false, data: null, message: "세션이 만료되었습니다. 다시 로그인해 주세요." };
  }

  const json = (await res.json().catch(() => null)) as
    | (T & { message?: string })
    | null;
  const message =
    json && typeof json === "object" && "message" in json
      ? ((json as { message?: string }).message ?? null)
      : null;

  return { ok: res.ok, data: res.ok ? (json as T) : null, message };
}
