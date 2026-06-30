import { proxyAuthed } from "@/lib/admin/proxy";
import type { RealEstateRequestListItem } from "@/types/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/real-estate-requests — buying-support request list.
 * Backend returns newest-first (created_at desc); no client sort needed.
 */
export async function GET() {
  return proxyAuthed<{ items: RealEstateRequestListItem[] }>({
    path: "/real-estate-requests",
  });
}
