// @zenith/shared — Clock abstraction
// Reviewer issue #23: No direct new Date() in business logic.
// All time access goes through Clock for testability and determinism.

export interface Clock {
  now(): Date;
  isoNow(): string;
}

/** System clock — uses real system time. Only used at composition root. */
export const systemClock: Clock = {
  now: () => new Date(),
  isoNow: () => new Date().toISOString(),
};

/** Fixed clock — always returns the same time. Use in tests and formula evaluation. */
export function fixedClock(date: Date): Clock {
  return {
    now: () => date,
    isoNow: () => date.toISOString(),
  };
}

/** Offset clock — returns real time + offset. Use in timezone tests. */
export function offsetClock(offsetMs: number): Clock {
  return {
    now: () => new Date(Date.now() + offsetMs),
    isoNow: () => new Date(Date.now() + offsetMs).toISOString(),
  };
}
