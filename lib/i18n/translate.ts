import type { Dictionary } from "./dictionaries";
import { EN_DICTIONARY } from "./dictionaries";

/** Walk a dotted key path ("gnb.news") into a dictionary; null if missing/non-leaf. */
function lookup(dict: Dictionary, key: string): string | null {
  const parts = key.split(".");
  let node: string | Dictionary | undefined = dict;
  for (const part of parts) {
    if (typeof node !== "object" || node === null) return null;
    node = node[part];
  }
  // Only string leaves count. Empty string = "not translated" → fall through.
  return typeof node === "string" && node !== "" ? node : null;
}

/** Replace {placeholders} with provided values. */
function interpolate(
  template: string,
  vars?: Record<string, string | number>
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match
  );
}

/**
 * Resolve a translation key with the PRD fallback chain (§8, §10.4):
 *   active locale → `en` → "" (never expose the raw key string).
 *
 * `dict` is the active locale's dictionary; `en` is always the final fallback.
 */
export function translate(
  dict: Dictionary,
  key: string,
  vars?: Record<string, string | number>
): string {
  const value = lookup(dict, key) ?? lookup(EN_DICTIONARY, key);
  if (value === null) {
    // No translation anywhere — return empty string rather than the key.
    return "";
  }
  return interpolate(value, vars);
}

export type TranslateFn = (
  key: string,
  vars?: Record<string, string | number>
) => string;
