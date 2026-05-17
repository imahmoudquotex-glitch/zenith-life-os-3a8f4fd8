/**
 * Wave 06 — Fractional Index Engine
 * src/lib/block-engine/fractional-index.ts
 *
 * القواعد:
 * - Position = double precision
 * - Between two: (prev + next) / 2
 * - Append: max + 1000
 * - Gap < 0.001 → يجب renormalize (via DB RPC)
 * - Client لا يفترض أرقام ثابتة، re-fetch بعد reorder
 */

export const POSITION_GAP_MIN = 0.001;
export const POSITION_INITIAL_STEP = 1000;

/**
 * يحسب position جديدة بين prev و next.
 * لو لا يوجد prev أو next يحسب موقعاً في البداية أو النهاية.
 */
export function generatePositionBetween(
  prev: number | null,
  next: number | null
): number {
  if (prev === null && next === null) {
    return POSITION_INITIAL_STEP;
  }
  if (prev === null) {
    return (next! - POSITION_INITIAL_STEP > 0)
      ? next! - POSITION_INITIAL_STEP
      : next! / 2;
  }
  if (next === null) {
    return prev + POSITION_INITIAL_STEP;
  }
  return (prev + next) / 2;
}

/**
 * يتحقق من أن الـ gap كافي (لا يحتاج renormalize)
 */
export function needsRenormalize(prev: number, next: number): boolean {
  return Math.abs(next - prev) < POSITION_GAP_MIN;
}

/**
 * يولّد positions مُعاد تطبيعها لـ array من blocks
 * يُستخدم بعد اكتشاف gap صغيرة جداً
 */
export function renormalizePositions(count: number): number[] {
  return Array.from({ length: count }, (_, i) => (i + 1) * POSITION_INITIAL_STEP);
}
