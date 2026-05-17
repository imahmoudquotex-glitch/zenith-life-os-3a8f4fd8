// @zenith/audit — Audit Logger
// Tracks all security-relevant events (auth, data access, mutations)

import type { Result } from '@zenith/shared/result';

export interface AuditEvent {
  readonly eventType: string;       // e.g. 'auth.signin', 'data.create', 'vault.access'
  readonly userId: string;
  readonly workspaceId: string;
  readonly resourceType?: string;   // e.g. 'database', 'page', 'block'
  readonly resourceId?: string;
  readonly metadata?: Record<string, unknown>;
  readonly timestamp: string;       // ISO 8601
  readonly ip?: string;
  readonly userAgent?: string;
}

export interface AuditLogger {
  log(event: AuditEvent): Promise<Result<void>>;
}

/**
 * Stub implementation — writes to console.error in development.
 * Production implementation writes to audit_events table via SECURITY DEFINER function.
 */
export class ConsoleAuditLogger implements AuditLogger {
  async log(event: AuditEvent): Promise<Result<void>> {
    console.error('[AUDIT]', JSON.stringify(event));
    return { ok: true, value: undefined };
  }
}

export function createAuditEvent(
  eventType: string,
  userId: string,
  workspaceId: string,
  timestamp: string,
  extra?: Partial<AuditEvent>,
): AuditEvent {
  return {
    eventType,
    userId,
    workspaceId,
    timestamp,
    ...extra,
  };
}
