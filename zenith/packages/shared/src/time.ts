/**
 * @zenith/shared/time — Clock abstraction.
 * Use this instead of `new Date()` or `Date.now()` for testability and timezone consistency.
 * ADR-0010: All timestamps use UTC internally; display converts to user timezone.
 */

export interface Clock {
  now(): Date
  nowMs(): number
  nowIso(): string
}

export const systemClock: Clock = {
  now:    () => new Date(),
  nowMs:  () => Date.now(),
  nowIso: () => new Date().toISOString(),
}

/** For tests: create a fixed clock */
export function fixedClock(ms: number): Clock {
  return {
    now:    () => new Date(ms),
    nowMs:  () => ms,
    nowIso: () => new Date(ms).toISOString(),
  }
}

/** Global clock — can be swapped in tests */
let _clock: Clock = systemClock
export function getClock(): Clock { return _clock }
export function setClock(c: Clock): void { _clock = c }
export function resetClock(): void { _clock = systemClock }

// Convenience wrappers
export const now    = (): Date   => _clock.now()
export const nowMs  = (): number => _clock.nowMs()
export const nowIso = (): string => _clock.nowIso()
