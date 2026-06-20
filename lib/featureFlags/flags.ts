/**
 * Feature flags shared by the public read path (middleware, home card, BFF).
 *
 * Source of truth is the backend; the frontend reads a small public snapshot.
 * Writes go through the admin proxy (see feature-flag-plan §3). Until the
 * backend endpoint exists (FEATURE_FLAGS_API_BASE unset), every flag defaults
 * to the safe value so Price Gap stays internal-only.
 */

import { backendBase } from "@/lib/env/backend";

export interface FeatureFlags {
  /** Price Gap Monitor public visibility. false → whitelisted IPs only. */
  priceGapPublic: boolean;
}

export const DEFAULT_FLAGS: FeatureFlags = {
  priceGapPublic: false,
};

/**
 * Backend host root (e.g. http://localhost:8080). The public flags endpoint
 * lives at `${BASE}/api/feature-flags` per the backend's public-API convention.
 * Resolves from the shared BACKEND_API_BASE; FEATURE_FLAGS_API_BASE still wins
 * when set (legacy override).
 */
const BASE = backendBase("", process.env.FEATURE_FLAGS_API_BASE);

/**
 * Fetch the public flag snapshot from the backend, cached briefly (the backend
 * sends Cache-Control: 30s; rollout changes don't need to be instant). Falls
 * back to DEFAULT_FLAGS on any error or when the backend is not configured.
 *
 * Called from the middleware (self-origin safe — it hits the backend host
 * directly, not our own /api/feature-flags route).
 */
export async function fetchFeatureFlags(): Promise<FeatureFlags> {
  if (!BASE) return DEFAULT_FLAGS;
  try {
    const res = await fetch(`${BASE}/api/feature-flags`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return DEFAULT_FLAGS;
    const json = await res.json();
    const data = json?.data ?? {};
    return {
      priceGapPublic: data.priceGapPublic === true,
    };
  } catch {
    return DEFAULT_FLAGS;
  }
}
