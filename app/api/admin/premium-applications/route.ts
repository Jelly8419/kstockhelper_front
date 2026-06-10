import { proxyAuthed } from "@/lib/admin/proxy";
import type { PremiumApplication } from "@/types/admin";

export const dynamic = "force-dynamic";

/** GET /api/admin/premium-applications — pending premium applications (oldest-first). */
export async function GET() {
  return proxyAuthed<{ items: PremiumApplication[] }>({
    path: "/premium-applications",
  });
}
