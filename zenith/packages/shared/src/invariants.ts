/**
 * Architectural invariant constants — single source of truth.
 * Used by all check:* scripts and runtime guards.
 *
 * MANIFEST_VERSION: 1
 */

// ── Crypto ──────────────────────────────────────────────────────────────────
export const FORBIDDEN_CRYPTO = [
  'AES-ECB', 'MD5', 'SHA1', '3DES', 'RC4',
  'createCipher',   // deprecated Node.js
  'createDecipher', // deprecated Node.js
  'PBKDF2',         // too fast for vault KDF
  'bcrypt',         // not allowed for vault (use Argon2id)
] as const;

export const ALLOWED_CRYPTO = [
  'Argon2id', 'XChaCha20-Poly1305', 'X25519', 'Ed25519',
  'xchacha20poly1305', // @noble/ciphers identifier
] as const;

export const FORBIDDEN_CRYPTO_REGEX = new RegExp(
  FORBIDDEN_CRYPTO.map(c => `\\b${c.replace(/[-]/g, '[-]?')}\\b`).join('|'),
  'i',
);

// ── Money ────────────────────────────────────────────────────────────────────
export const MONEY_COLUMN_SUFFIX_REGEX = /\b\w+_(cents|minor)\b/;
export const FORBIDDEN_MONEY_TYPES = ['FLOAT', 'NUMERIC', 'REAL', 'DOUBLE PRECISION', 'DECIMAL'] as const;
export const FORBIDDEN_MONEY_TYPES_REGEX = new RegExp(
  `\\b(${FORBIDDEN_MONEY_TYPES.join('|')})\\b`,
  'i',
);

// ── Naming ───────────────────────────────────────────────────────────────────
export const MIGRATION_NAME_REGEX = /^\d{4}_[a-z][a-z0-9_]+\.sql$/;
export const ULID_REGEX = /^[0-9A-Z]{26}$/;
export const TIMESTAMP_SUFFIX_REGEX = /_at\b/;

// ── Wave migration ranges ─────────────────────────────────────────────────────
export const WAVE_RANGES = {
  w00: [1, 99],
  w01: [100, 199],
  w02: [200, 299],
  w03: [300, 399],
  w04: [400, 499],
  w05: [500, 599],
  w06: [600, 699],
  w07: [700, 799],
  w08: [800, 899],
} as const satisfies Record<string, [number, number]>;

export function getMigrationWave(num: number): string | null {
  for (const [wave, [lo, hi]] of Object.entries(WAVE_RANGES)) {
    if (num >= lo && num <= hi) return wave;
  }
  return null;
}

// ── Tenant / RLS ─────────────────────────────────────────────────────────────
export const REQUIRED_TENANT_COLUMN = 'workspace_id';
export const EXEMPT_TABLES = ['workspaces', 'users', 'idempotency_keys', 'audit_events', 'feature_flags'] as const;

// ── Route envelope ───────────────────────────────────────────────────────────
export const ROUTE_ENVELOPE_WRAPPER = 'withEnvelope';
export const ROUTE_IDEMPOTENCY_WRAPPER = 'withIdempotency';

// ── Timezone ─────────────────────────────────────────────────────────────────
export const FORBIDDEN_TZ_PATTERNS = [
  /['"]\+\d{2}:\d{2}['"]/,       // '+03:00'
  /['"]UTC[+-]\d/,                // 'UTC+3'
  /new Date\(\)\.getTimezoneOffset/,
] as const;
export const DEFAULT_TIMEZONE = 'Africa/Cairo';

// ── VAPID / secrets ──────────────────────────────────────────────────────────
export const SERVER_ONLY_ENV_VARS = [
  'VAPID_PRIVATE_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'RESEND_API_KEY',
  'AUTH_JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'N8N_WEBHOOK_SECRET',
] as const;

// ── SW deny list ─────────────────────────────────────────────────────────────
export const SW_DENY_PREFIXES = ['/api/', '/auth/', '/vault/', '/account/', '/admin/'] as const;

// ── Manifest invariant IDs (for check:manifest) ──────────────────────────────
export const MANIFEST_INVARIANTS = [
  { id: 'CRYPTO_001', script: 'check:crypto' },
  { id: 'CRYPTO_002', script: 'check:vault-leak' },
  { id: 'CRYPTO_003', script: 'check:vapid-key-not-in-client' },
  { id: 'TENANT_001', script: 'check:tenants' },
  { id: 'TENANT_002', script: 'check:rls' },
  { id: 'TENANT_003', script: 'check:no-sql-in-routes' },
  { id: 'MONEY_001',  script: 'check:money' },
  { id: 'AUDIT_001',  script: 'check:audit-events' },
  { id: 'AUDIT_002',  script: 'check:audit-merkle' },
  { id: 'AUDIT_003',  script: 'check:idempotency' },
  { id: 'NAMING_001', script: 'check:naming' },
  { id: 'NAMING_002', script: 'check:migrations' },
  { id: 'FRONTEND_001', script: 'check:dark-only-tokens' },
  { id: 'FRONTEND_002', script: 'check:no-ai-in-render' },
  { id: 'FRONTEND_003', script: 'check:timezone-hardcode' },
  { id: 'ROUTE_001',  script: 'check:routes-envelope' },
  { id: 'WORKER_001', script: 'check:worker-leases' },
  { id: 'PWA_001',    script: 'check:sw-audit' },
] as const;
