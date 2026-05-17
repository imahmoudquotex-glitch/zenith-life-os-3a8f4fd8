/**
 * Step 07.2 — Deep Merge for Settings (Phase 06/07 requirement)
 * ❌ Anti-pattern: Settings update يستبدل JSON كاملاً = data loss
 * ✅ Pattern: deepMerge يدمج فقط المفاتيح المُرسلة
 */
export function deepMerge<T extends Record<string, unknown>>(
  base: T,
  patch: Partial<T>
): T {
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    if (
      v !== null &&
      v !== undefined &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      typeof out[k] === "object" &&
      out[k] !== null &&
      !Array.isArray(out[k])
    ) {
      out[k] = deepMerge(
        out[k] as Record<string, unknown>,
        v as Record<string, unknown>
      );
    } else if (v !== undefined) {
      out[k] = v;
    }
  }
  return out as T;
}
