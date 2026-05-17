// @zenith/audit — Audit event types
// Shared types for the audit_events table.

export interface AuditEvent {
  id: string;            // ULID
  workspaceId: string;
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  beforeState?: unknown;
  afterState?: unknown;
  metadata: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;     // ISO 8601
}

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'archive'
  | 'restore'
  | 'share'
  | 'unshare'
  | 'move'
  | 'duplicate'
  | 'import'
  | 'export'
  | 'signin'
  | 'signout'
  | 'settings_change';
