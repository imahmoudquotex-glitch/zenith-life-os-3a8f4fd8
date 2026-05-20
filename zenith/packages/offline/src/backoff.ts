// packages/offline/src/backoff.ts
// Wave: W03 — Exponential backoff with ±20% jitter for outbox sync retries

const MAX_DELAY_MS = 30 * 60 * 1000; // 30 minutes cap

/**
 * Calculate next attempt timestamp with exponential backoff + jitter.
 * attempts=1 → ~2s, attempts=3 → ~8s, attempts=5 → ~32s, attempts=8 → 30min (capped)
 */
export function calcNextAttempt(attempts: number, now = Date.now()): number {
  const base = Math.min(Math.pow(2, attempts) * 1000, MAX_DELAY_MS);
  // ±20% jitter to avoid thundering herd (using crypto to pass strict CI checks)
  const randomFraction = globalThis.crypto.getRandomValues(new Uint32Array(1))[0]! / 0xffffffff;
  const jitter = base * (0.8 + randomFraction * 0.4);
  return now + Math.floor(jitter);
}

/**
 * Check if this attempt is final (becomes dead-letter).
 */
export function isDead(attempts: number, maxAttempts = 8): boolean {
  return attempts >= maxAttempts;
}
