/**
 * Server-side client for the backend admin API (`/internal/admin/*`).
 *
 * Only used from route handlers (app/api/admin/*) — never from the browser.
 * The browser talks to our own /api/admin/* proxy routes, which attach the
 * admin JWT (stored in an HttpOnly cookie) before calling the backend. This
 * keeps the token off the client and centralizes 401 handling.
 */

const BASE_URL = process.env.ADMIN_API_BASE_URL;

/** Shape returned to our proxy routes. `unauthorized` flags an expired/invalid token. */
export interface AdminApiResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  /** Error message from the backend's `{ success, message }` envelope, if any. */
  message: string | null;
  /** True when the backend responded 401 (token missing/expired/invalid). */
  unauthorized: boolean;
}

interface CallOptions {
  method?: "GET" | "POST" | "PATCH";
  /** Admin JWT to send as `Authorization: Bearer <token>`. Omit for login. */
  token?: string | null;
  body?: unknown;
}

/**
 * Call a backend admin endpoint. `path` is relative to ADMIN_API_BASE_URL
 * (e.g. "/users", "/auth/login", `/users/${id}/memo`).
 */
export async function callAdminApi<T = unknown>(
  path: string,
  { method = "GET", token, body }: CallOptions = {}
): Promise<AdminApiResult<T>> {
  if (!BASE_URL) {
    console.error("ADMIN_API_BASE_URL is not configured.");
    return {
      ok: false,
      status: 503,
      data: null,
      message: "관리자 서비스를 일시적으로 사용할 수 없습니다.",
      unauthorized: false,
    };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-internal-secret": process.env.INTERNAL_API_SECRET ?? "",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch (e) {
    console.error(`admin api fetch error (${method} ${path}):`, e);
    return {
      ok: false,
      status: 502,
      data: null,
      message: "요청을 처리하지 못했습니다. 다시 시도해 주세요.",
      unauthorized: false,
    };
  }

  // Backend always responds JSON; tolerate empty/invalid bodies.
  const json = (await res.json().catch(() => null)) as
    | (T & { success?: boolean; message?: string })
    | null;

  const message =
    json && typeof json === "object" && "message" in json
      ? ((json as { message?: string }).message ?? null)
      : null;

  return {
    ok: res.ok,
    status: res.status,
    data: res.ok ? (json as T) : null,
    message,
    unauthorized: res.status === 401,
  };
}
