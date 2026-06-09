import { proxyAuthed } from "@/lib/admin/proxy";
import type { AdminUserListItem } from "@/types/admin";

export const dynamic = "force-dynamic";

/** GET /api/admin/users — member list (newest-first; includes inactive). */
export async function GET() {
  return proxyAuthed<{ users: AdminUserListItem[] }>({ path: "/users" });
}
