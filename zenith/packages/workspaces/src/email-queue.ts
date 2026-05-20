/**
 * @zenith/workspaces — Email queue helper
 * Enqueues outbound emails (stub — actual sender in Wave 12).
 */

import type { PoolClient } from 'pg'
import { createUlid, systemClock } from '@zenith/shared'

export type EmailTemplate =
  | 'workspace_invitation'
  | 'workspace_member_joined'
  | 'workspace_ownership_transferred'

/**
 * Enqueue an outbound email.
 * The actual sending is handled by a worker in Wave 12.
 */
export async function enqueueEmail(
  client: PoolClient,
  input: {
    workspaceId: string | null
    toEmail: string
    template: EmailTemplate
    payload: Record<string, unknown>
    scheduleAt?: Date
  }
): Promise<string> {
  const id = createUlid()

  await client.query(
    `INSERT INTO public.outbound_emails (id, workspace_id, to_email, template, payload_json, scheduled_at, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
    [
      id,
      input.workspaceId,
      input.toEmail,
      input.template,
      JSON.stringify(input.payload),
      input.scheduleAt ?? systemClock.now(),
    ]
  )

  return id
}
