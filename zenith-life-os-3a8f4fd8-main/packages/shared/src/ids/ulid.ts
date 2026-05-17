// @zenith/shared — ULID Generator
// Reviewer issue #10: Business IDs = ULID TEXT, not UUID.
// ULID = Universally Unique Lexicographically Sortable Identifier
// Format: 26 chars from Crockford Base32 [0-9A-HJKMNP-TV-Z]

const CROCKFORD_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/**
 * Generate a ULID (Universally Unique Lexicographically Sortable Identifier).
 * Time-sortable, 26 chars, Crockford Base32.
 */
export function generateULID(): string {
  const now = Date.now();
  const timeChars = encodeTime(now, 10);
  const randomChars = encodeRandom(16);
  return timeChars + randomChars;
}

/**
 * Validate that a string is a valid ULID.
 */
export function isValidULID(value: string): boolean {
  return /^[0-9A-HJKMNP-TV-Z]{26}$/.test(value);
}

/**
 * Assert that a value is a valid ULID, returning Result.
 */
export function assertULID(value: string): { valid: boolean; error?: string } {
  if (typeof value !== 'string') {
    return { valid: false, error: 'ULID must be a string' };
  }
  if (value.length !== 26) {
    return { valid: false, error: `ULID must be 26 chars, got ${String(value.length)}` };
  }
  if (!isValidULID(value)) {
    return { valid: false, error: 'ULID contains invalid characters' };
  }
  return { valid: true };
}

function encodeTime(now: number, length: number): string {
  let mod: number;
  let str = '';
  let remaining = now;
  for (let i = length; i > 0; i--) {
    mod = remaining % 32;
    str = CROCKFORD_BASE32.charAt(mod) + str;
    remaining = (remaining - mod) / 32;
  }
  return str;
}

function encodeRandom(length: number): string {
  let str = '';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < length; i++) {
    str += CROCKFORD_BASE32.charAt(bytes[i]! % 32);
  }
  return str;
}
