import { proxyAuthed } from "@/lib/admin/proxy";
import type { AdminUserDetail } from "@/types/admin";

export const dynamic = "force-dynamic";

/** GET /api/admin/users/{userId} — full member detail. */
export async function GET(
  _request: Request,
  { params }: { params: { userId: string } }
) {
  return proxyAuthed<AdminUserDetail>({
    path: `/users/${encodeURIComponent(params.userId)}`,
  });
}
