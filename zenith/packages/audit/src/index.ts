/**
 * @zenith/audit — Append-only audit log
 *
 * INV-13: Audit events are immutable. No UPDATE/DELETE.
 * Sanitizer strips passwords, tokens, and vault content before writing.
 */

export type AuditActorType = 'user' | 'system' | 'worker' | 'api_key'

export interface AuditActor {
  readonly type: AuditActorType
  readonly id: string
  readonly ip?: string
  readonly userAgent?: string
}

export interface AuditEvent {
  readonly id: string
  readonly workspaceId: string
  readonly actor: AuditActor
  readonly action: string // e.g. 'note.created', 'vault.accessed'
  readonly resourceType: string
  readonly resourceId: string
  readonly metadata?: Record<string, unknown>
  readonly createdAt: string
}

// ─── Sanitizer ─────────────────────────────────────────

const SENSITIVE_KEYS = new Set([
  'password', 'token', 'secret', 'apiKey', 'api_key',
  'authorization', 'cookie', 'session', 'masterKey',
  'master_key', 'passphrase', 'private_key', 'privateKey',
  'plaintext', 'decrypted', 'content', 'body',
])

export function sanitizeMetadata(
  meta: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!meta) return undefined
  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(meta)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]'
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

// ─── Writer Interface ──────────────────────────────────

export interface AuditWriter {
  write(event: Omit<AuditEvent, 'id' | 'createdAt'>): Promise<void>
}

export * from './merkle';
