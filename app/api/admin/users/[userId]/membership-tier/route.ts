import { NextRequest, NextResponse } from "next/server";
import { proxyAuthed } from "@/lib/admin/proxy";
import type { AdminMutationResult, MembershipTier } from "@/types/admin";

export const dynamic = "force-dynamic";

const TIERS: MembershipTier[] = ["GENERAL", "PREMIUM"];

/** PATCH /api/admin/users/{userId}/membership-tier  { membershipTier } */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  let body: { membershipTier?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "잘못된 요청입니다." },
      { status: 400 }
    );
  }

  const tier = body.membershipTier;
  if (typeof tier !== "string" || !TIERS.includes(tier as MembershipTier)) {
    return NextResponse.json(
      { success: false, message: "membershipTier는 GENERAL 또는 PREMIUM이어야 합니다." },
      { status: 400 }
    );
  }

  return proxyAuthed<AdminMutationResult>({
    path: `/users/${encodeURIComponent(params.userId)}/membership-tier`,
    method: "PATCH",
    body: { membershipTier: tier },
  });
}
