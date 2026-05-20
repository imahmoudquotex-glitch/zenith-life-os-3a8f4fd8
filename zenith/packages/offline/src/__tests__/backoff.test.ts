// packages/offline/src/__tests__/backoff.test.ts
// Wave: W03 — Unit tests for exponential backoff calculator

import { describe, it, expect } from 'vitest';
import { calcNextAttempt, isDead } from '../backoff';

describe('calcNextAttempt', () => {
  it('returns a timestamp greater than now', () => {
    const now = Date.now();
    const next = calcNextAttempt(1, now);
    expect(next).toBeGreaterThan(now);
  });

  it('increases with more attempts', () => {
    const now = Date.now();
    const t1 = calcNextAttempt(1, now);
    const t5 = calcNextAttempt(5, now);
    expect(t5).toBeGreaterThan(t1);
  });

  it('is capped at 30 minutes max', () => {
    const now = Date.now();
    const t = calcNextAttempt(100, now);
    const maxMs = 30 * 60 * 1000;
    // With 20% jitter, max is base * 1.2 where base = 30min
    expect(t - now).toBeLessThanOrEqual(maxMs * 1.2 + 10);
  });

  it('applies jitter — same inputs can produce different results', () => {
    const now = Date.now();
    const results = new Set(
      Array.from({ length: 10 }, () => calcNextAttempt(3, now))
    );
    // With random jitter, at least 2 different values in 10 runs
    expect(results.size).toBeGreaterThan(1);
  });
});

describe('isDead', () => {
  it('returns false before maxAttempts', () => {
    expect(isDead(7, 8)).toBe(false);
  });

  it('returns true at maxAttempts', () => {
    expect(isDead(8, 8)).toBe(true);
  });

  it('returns true beyond maxAttempts', () => {
    expect(isDead(10, 8)).toBe(true);
  });

  it('default maxAttempts is 8', () => {
    expect(isDead(8)).toBe(true);
    expect(isDead(7)).toBe(false);
  });
});
