/**
 * ULID — Branded Type + Generator
 * Phase 00 INV-12: All PKs are TEXT ULID.
 * Phase 01: Enhanced with branded types for compile-time safety.
 */

// ─── Branded Type ──────────────────────────────────────
export type Ulid = string & { readonly __brand: 'Ulid' }

export const ULID_REGEX = /^[0-9A-HJKMNP-TV-Z]{26}$/

// ─── Crockford Base32 ──────────────────────────────────
const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
const ENCODING_LEN = ENCODING.length
const TIME_LEN = 10
const RANDOM_LEN = 16

let lastTime = 0
let lastRandom: number[] = []

function encodeTime(now: number, len: number): string {
  let str = ''
  let time = now
  for (let i = len; i > 0; i--) {
    str = ENCODING[time % ENCODING_LEN] + str
    time = Math.floor(time / ENCODING_LEN)
  }
  return str
}

/**
 * Generate a new ULID (monotonic within same millisecond).
 */
export function createUlid(): Ulid {
  const now = Date.now()
  if (now === lastTime) {
    let i = lastRandom.length - 1
    while (i >= 0 && lastRandom[i] === ENCODING_LEN - 1) {
      lastRandom[i] = 0
      i--
    }
    if (i >= 0 && lastRandom[i] !== undefined) lastRandom[i] = lastRandom[i]! + 1
    return (encodeTime(now, TIME_LEN) + lastRandom.map((r) => ENCODING[r]).join('')) as Ulid
  }

  lastTime = now
  lastRandom = Array.from(
    crypto.getRandomValues(new Uint8Array(RANDOM_LEN)),
    (b) => b % ENCODING_LEN,
  )
  return (encodeTime(now, TIME_LEN) + lastRandom.map((r) => ENCODING[r]).join('')) as Ulid
}

/**
 * Validate a string as ULID.
 */
export function isUlid(value: string): value is Ulid {
  return typeof value === 'string' && value.length === 26 && ULID_REGEX.test(value)
}

/**
 * Assert a string is a valid ULID. Throws on invalid.
 */
export function assertUlid(value: string): asserts value is Ulid {
  if (!isUlid(value)) {
    throw new Error(`INVALID_ULID: "${value}" does not match ^[0-9A-HJKMNP-TV-Z]{26}$`)
  }
}

/**
 * Extract timestamp from a ULID.
 */
export function ulidToTimestamp(id: Ulid): Date {
  const timePart = id.slice(0, TIME_LEN)
  let time = 0
  for (const char of timePart) {
    time = time * ENCODING_LEN + ENCODING.indexOf(char)
  }
  return new Date(time)
}

/** PostgreSQL CHECK constraint SQL fragment */
export const ULID_CHECK_SQL = `CHECK (id ~ '^[0-9A-HJKMNP-TV-Z]{26}$')`
