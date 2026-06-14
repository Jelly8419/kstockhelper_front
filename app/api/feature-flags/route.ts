import { NextResponse } from "next/server";
import { fetchFeatureFlags } from "@/lib/featureFlags/flags";

// Cached for 60s (see fetchFeatureFlags); flag rollout doesn't need to be instant.
export const revalidate = 60;

/**
 * Public feature-flag snapshot read by the client (e.g. to decide UI visibility).
 * No auth. Falls back to safe defaults when the backend is unconfigured.
 */
export async function GET() {
  const flags = await fetchFeatureFlags();
  return NextResponse.json({ success: true, code: "FEATURE_FLAGS", data: flags });
}
