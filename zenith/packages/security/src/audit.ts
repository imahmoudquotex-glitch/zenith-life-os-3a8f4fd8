// packages/security/src/audit.ts
// Wave: W03 — Audit event writer using Supabase service role client
// Writes to audit_events table (NOT audit_logs — W03 contract)
// Uses redactPii + redactSecrets before any insert

import type { SupabaseClient } from '@supabase/supabase-js';
import { redactPii } from './pii-redactor';
import { redactSecrets } from './secret-redactor';

export type AuditAction =
  | 'user.login'
  | 'user.logout'
  | 'user.password_change'
  | 'user.mfa_enabled'
  | 'user.mfa_disabled'
  | 'session.revoked'
  | 'task.create'
  | 'task.update'
  | 'task.delete'
  | 'note.create'
  | 'note.update'
  | 'note.delete'
  | 'vault.item_create'
  | 'vault.item_update'
  | 'vault.item_delete'
  | 'vault.passphrase_set'
  | 'vault.passphrase_verify_failed'
  | 'expense.create'
  | 'expense.update'
  | 'expense.delete'
  | 'workspace.settings_change'
  | 'api_key.create'
  | 'api_key.revoke'
  | 'webhook.rejected'
  | 'webhook.replayed_nonce'
  | 'csrf.rejected'
  | 'redirect.blocked'
  | string;

export type AuditEventInput = {
  workspaceId: string;
  actorUserId: string;
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  requestId?: string;
};

/**
 * Insert an audit event using Supabase service role client.
 * Automatically redacts PII and secrets from metadata.
 *
 * NEVER pass:
 * - Passwords, tokens, HMAC keys
 * - Full request bodies
 * - Vault plaintext
 */
export async function writeAuditEvent(
  supabase: SupabaseClient,
  event: AuditEventInput,
): Promise<void> {
  const safeMetadata = event.metadata
    ? JSON.parse(redactPii(redactSecrets(JSON.stringify(event.metadata))))
    : {};

  const { error } = await supabase.from('audit_events').insert({
    workspace_id: event.workspaceId,
    actor_user_id: event.actorUserId,
    action: event.action,
    resource_type: event.resourceType ?? null,
    resource_id: event.resourceId ?? null,
    metadata: safeMetadata,
    ip: event.ip ?? null,
    user_agent: event.userAgent ?? null,
    request_id: event.requestId ?? null,
  });

  if (error) {
    // Log to stderr only — never throw (audit failures should not break the request)
    console.error('[audit] writeAuditEvent failed:', error.message, { action: event.action });
  }
}

/**
 * @deprecated Use writeAuditEvent instead.
 * Kept for backward compat — will be removed in Wave 05.
 */
export async function logAudit(
  supabase: SupabaseClient,
  workspaceId: string,
  actorUserId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata: Record<string, unknown>,
): Promise<void> {
  return writeAuditEvent(supabase, {
    workspaceId,
    actorUserId,
    action,
    resourceType,
    resourceId,
    metadata,
  });
}
