/**
 * Time — Clock abstraction.
 * Phase 01 contract: `new Date()` is BANNED in business logic.
 * Use `systemClock.now()` or inject a Clock.
 */

// ─── Clock Interface ───────────────────────────────────
export interface Clock {
  /** Returns current time as Date */
  now(): Date
  /** Returns current time as ISO string (UTC) */
  nowISO(): string
  /** Returns current time as Unix milliseconds */
  nowMs(): number
}

/**
 * System clock — uses real time.
 * Use this in production code.
 */
export const systemClock: Clock = {
  now: () => new Date(),
  nowISO: () => new Date().toISOString(),
  nowMs: () => Date.now(),
}

/**
 * Fixed clock — always returns the same time.
 * Use this in tests for deterministic behavior.
 */
export function fixedClock(date: Date | string): Clock {
  const d = typeof date === 'string' ? new Date(date) : date
  return {
    now: () => new Date(d.getTime()),
    nowISO: () => d.toISOString(),
    nowMs: () => d.getTime(),
  }
}

/**
 * Monotonic clock — increments by `stepMs` on each call.
 * Use this in tests that need deterministic ordering.
 */
export function monotonicClock(startDate: Date | string, stepMs = 1): Clock {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  let offset = 0
  return {
    now: () => {
      const d = new Date(start.getTime() + offset)
      offset += stepMs
      return d
    },
    nowISO: () => {
      const d = new Date(start.getTime() + offset)
      offset += stepMs
      return d.toISOString()
    },
    nowMs: () => {
      const ms = start.getTime() + offset
      offset += stepMs
      return ms
    },
  }
}
