import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/waitlist
 *
 * Registers the authenticated user on the Premium waitlist (PRD §8). Restricted
 * regions can't access exchange-linked Premium yet; this captures interest for a
 * future content-only tier or expanded country support.
 *
 * Requires a logged-in session. Duplicate registrations are de-duped via the
 * table's `unique (user_id)` constraint — a repeat call returns status
 * "already" rather than erroring. No request body is needed; the user comes from
 * the trusted session.
 */
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Not authenticated." },
      { status: 401 }
    );
  }

  const { error } = await supabase
    .from("waitlist")
    .insert({ user_id: user.id, email: user.email ?? null });

  if (error) {
    // 23505 = unique_violation → the user is already on the waitlist.
    if (error.code === "23505") {
      return NextResponse.json({ success: true, status: "already" });
    }
    console.error("waitlist insert error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to join the waitlist." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, status: "ok" });
}
