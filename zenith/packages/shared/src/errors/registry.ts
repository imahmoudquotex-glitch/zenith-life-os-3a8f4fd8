/**
 * Zenith Error Registry
 * Phase 00 Invariant: Structured, predictable error codes.
 * Format: DOMAIN_CODE (e.g., AUTH_001, RLS_001, AI_001)
 */

export const ErrorRegistry = {
  // ─── Auth ─────────────────────────────────────────
  AUTH_001: { message: 'Invalid credentials', httpStatus: 401, retry: false },
  AUTH_002: { message: 'Session expired', httpStatus: 401, retry: true },
  AUTH_003: { message: 'Insufficient permissions', httpStatus: 403, retry: false },
  AUTH_004: { message: 'Account locked', httpStatus: 423, retry: false },
  AUTH_005: { message: 'MFA required', httpStatus: 403, retry: false },

  // ─── Workspace ─────────────────────────────────────
  WS_001: { message: 'Workspace not found', httpStatus: 404, retry: false },
  WS_002: { message: 'Workspace limit exceeded', httpStatus: 429, retry: false },
  WS_003: { message: 'Invalid workspace context', httpStatus: 400, retry: false },

  // ─── RLS / Tenant ──────────────────────────────────
  RLS_001: { message: 'Tenant context not set', httpStatus: 500, retry: false },
  RLS_002: { message: 'Cross-tenant access denied', httpStatus: 403, retry: false },
  RLS_003: { message: 'RLS policy violation', httpStatus: 403, retry: false },

  // ─── AI ─────────────────────────────────────────────
  AI_001: { message: 'AI quota exhausted', httpStatus: 429, retry: true },
  AI_002: { message: 'Sensitivity level blocks AI', httpStatus: 403, retry: false },
  AI_003: { message: 'AI provider unavailable', httpStatus: 503, retry: true },
  AI_004: { message: 'Prompt injection detected', httpStatus: 400, retry: false },
  AI_005: { message: 'Whisper mode active — AI disabled', httpStatus: 403, retry: false },

  // ─── Vault ──────────────────────────────────────────
  VAULT_001: { message: 'Decryption failed — invalid key', httpStatus: 400, retry: false },
  VAULT_002: { message: 'Vault locked', httpStatus: 423, retry: false },
  VAULT_003: { message: 'Key derivation timeout', httpStatus: 408, retry: true },

  // ─── Data ───────────────────────────────────────────
  DATA_001: { message: 'Entity not found', httpStatus: 404, retry: false },
  DATA_002: { message: 'Validation failed', httpStatus: 422, retry: false },
  DATA_003: { message: 'Conflict — entity already exists', httpStatus: 409, retry: false },
  DATA_004: { message: 'Immutable record — mutation denied', httpStatus: 403, retry: false },

  // ─── System ─────────────────────────────────────────
  SYS_001: { message: 'Internal server error', httpStatus: 500, retry: true },
  SYS_002: { message: 'Service unavailable', httpStatus: 503, retry: true },
  SYS_003: { message: 'Rate limit exceeded', httpStatus: 429, retry: true },
  SYS_004: { message: 'Invalid request', httpStatus: 400, retry: false },

  // ─── MVP Gate ───────────────────────────────────────
  MVP_001: { message: 'Feature outside MVP scope', httpStatus: 501, retry: false },
} as const

export type ErrorCode = keyof typeof ErrorRegistry

export class ZenithError extends Error {
  public readonly code: ErrorCode
  public readonly httpStatus: number
  public readonly retry: boolean

  constructor(code: ErrorCode, details?: string) {
    const entry = ErrorRegistry[code]
    super(details ? `${entry.message}: ${details}` : entry.message)
    this.name = 'ZenithError'
    this.code = code
    this.httpStatus = entry.httpStatus
    this.retry = entry.retry
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        retry: this.retry,
      },
    }
  }
}
