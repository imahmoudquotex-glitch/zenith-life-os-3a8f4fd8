/**
 * @zenith/workspaces — InvitationService
 * Email-based workspace invitations with 14-day expiry.
 * Token: 32-byte URL-safe random string.
 */

import type { PoolClient } from 'pg'
import { randomBytes } from 'crypto'
import { createUlid, ZenithError } from '@zenith/shared'
import { systemClock } from '@zenith/shared/time'
import type { WorkspaceRole } from '@zenith/auth'

export interface Invitation {
  id: string
  workspaceId: string
  invitedEmail: string
  role: WorkspaceRole
  token: string
  status: 'pending' | 'accepted' | 'declined' | 'revoked' | 'expired'
  invitedBy: string
  acceptedBy: string | null
  expiresAt: Date
  createdAt: Date
}

export const InvitationService = {
  /**
   * Create a new invitation.
   * Prevents duplicate pending invitations for same email+workspace.
   */
  async createInvitation(
    client: PoolClient,
    input: {
      workspaceId: string
      email: string
      role: Exclude<WorkspaceRole, 'owner'>
      invitedBy: string
    }
  ): Promise<Invitation> {
    // Check if already a member
    const existingMember = await client.query(
      `SELECT 1 FROM public.users_workspaces uw
       JOIN public.users u ON u.id = uw.user_id
       WHERE u.email = $1 AND uw.workspace_id = $2 AND uw.is_deleted = FALSE`,
      [input.email, input.workspaceId]
    )
    if (existingMember.rows.length > 0) {
      throw new ZenithError('DATA_003', 'User is already a member')
    }

    const id = createUlid()
    const token = randomBytes(32).toString('base64url')

    const result = await client.query(
      `INSERT INTO public.workspace_invitations
       (id, workspace_id, invited_email, role, token, status, invited_by, expires_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6, NOW() + INTERVAL '14 days', NOW(), NOW())
       RETURNING id, workspace_id, invited_email, role, token, status, invited_by, accepted_by, expires_at, created_at`,
      [id, input.workspaceId, input.email, input.role, token, input.invitedBy]
    )

    // Enqueue invitation email
    await client.query(
      `INSERT INTO public.outbound_emails (id, workspace_id, to_email, template, payload_json, created_at, updated_at)
       VALUES ($1, $2, $3, 'workspace_invitation', $4, NOW(), NOW())`,
      [createUlid(), input.workspaceId, input.email, JSON.stringify({ token, workspaceId: input.workspaceId })]
    )

    await writeAudit(client, {
      action: 'workspace.member.invited',
      actor: input.invitedBy,
      workspaceId: input.workspaceId,
      resourceType: 'invitation',
      resourceId: id,
      after: { email: input.email, role: input.role },
    })

    return mapInvitationRow(result.rows[0])
  },

  /**
   * List invitations for a workspace.
   */
  async listInvitations(
    client: PoolClient,
    workspaceId: string,
    status?: string
  ): Promise<Invitation[]> {
    let query = `SELECT id, workspace_id, invited_email, role, token, status, invited_by, accepted_by, expires_at, created_at
                 FROM public.workspace_invitations WHERE workspace_id = $1`
    const params: string[] = [workspaceId]

    if (status) {
      query += ` AND status = $2`
      params.push(status)
    }

    query += ` ORDER BY created_at DESC`
    const result = await client.query(query, params)
    return result.rows.map(mapInvitationRow)
  },

  /**
   * Revoke a pending invitation.
   */
  async revokeInvitation(client: PoolClient, invitationId: string, actorId: string): Promise<void> {
    const inv = await getInvitationById(client, invitationId)

    if (inv.status !== 'pending') {
      throw new ZenithError('DATA_004', `Cannot revoke invitation with status "${inv.status}"`)
    }

    await client.query(
      `UPDATE public.workspace_invitations SET status = 'revoked', updated_at = NOW() WHERE id = $1`,
      [invitationId]
    )

    await writeAudit(client, {
      action: 'workspace.member.invitation_revoked',
      actor: actorId,
      workspaceId: inv.workspaceId,
      resourceType: 'invitation',
      resourceId: invitationId,
    })
  },

  /**
   * Accept an invitation by token.
   * Validates email match and expiry.
   */
  async acceptInvitation(client: PoolClient, token: string, userId: string, userEmail: string): Promise<void> {
    const inv = await getInvitationByToken(client, token)

    if (inv.status !== 'pending') {
      throw new ZenithError('DATA_003', 'Invitation already used')
    }

    if (systemClock.now() > inv.expiresAt) {
      await client.query(
        `UPDATE public.workspace_invitations SET status = 'expired', updated_at = NOW() WHERE id = $1`,
        [inv.id]
      )
      throw new ZenithError('DATA_001', 'Invitation expired')
    }

    if (inv.invitedEmail.toLowerCase() !== userEmail.toLowerCase()) {
      throw new ZenithError('AUTH_003', 'Invitation email does not match current user')
    }

    // Accept
    await client.query(
      `UPDATE public.workspace_invitations SET status = 'accepted', accepted_by = $1, updated_at = NOW() WHERE id = $2`,
      [userId, inv.id]
    )

    // Add to workspace
    await client.query(
      `INSERT INTO public.users_workspaces (user_id, workspace_id, role, joined_at, invited_at)
       VALUES ($1, $2, $3, NOW(), $4)
       ON CONFLICT (user_id, workspace_id) DO UPDATE SET is_deleted = FALSE, role = $3, updated_at = NOW()`,
      [userId, inv.workspaceId, inv.role, inv.createdAt]
    )

    await writeAudit(client, {
      action: 'workspace.member.joined',
      actor: userId,
      workspaceId: inv.workspaceId,
      resourceType: 'membership',
      resourceId: userId,
      after: { role: inv.role, viaInvitation: inv.id },
    })
  },

  /**
   * Decline an invitation.
   */
  async declineInvitation(client: PoolClient, token: string, userId: string): Promise<void> {
    const inv = await getInvitationByToken(client, token)

    if (inv.status !== 'pending') {
      throw new ZenithError('DATA_004', 'Invitation is not pending')
    }

    await client.query(
      `UPDATE public.workspace_invitations SET status = 'declined', updated_at = NOW() WHERE id = $1`,
      [inv.id]
    )

    await writeAudit(client, {
      action: 'workspace.member.invitation_declined',
      actor: userId,
      workspaceId: inv.workspaceId,
      resourceType: 'invitation',
      resourceId: inv.id,
    })
  },

  /**
   * Expire old invitations (cron-callable).
   */
  async expireOldInvitations(client: PoolClient): Promise<number> {
    const result = await client.query(
      `UPDATE public.workspace_invitations SET status = 'expired', updated_at = NOW()
       WHERE status = 'pending' AND expires_at < NOW()
       RETURNING id`
    )
    return result.rowCount ?? 0
  },
}

async function getInvitationById(client: PoolClient, id: string): Promise<Invitation> {
  const result = await client.query(
    `SELECT id, workspace_id, invited_email, role, token, status, invited_by, accepted_by, expires_at, created_at
     FROM public.workspace_invitations WHERE id = $1`,
    [id]
  )
  if (result.rows.length === 0) throw new ZenithError('DATA_001', 'Invitation not found')
  return mapInvitationRow(result.rows[0])
}

async function getInvitationByToken(client: PoolClient, token: string): Promise<Invitation> {
  const result = await client.query(
    `SELECT id, workspace_id, invited_email, role, token, status, invited_by, accepted_by, expires_at, created_at
     FROM public.workspace_invitations WHERE token = $1`,
    [token]
  )
  if (result.rows.length === 0) throw new ZenithError('DATA_001', 'Invitation not found')
  return mapInvitationRow(result.rows[0])
}

function mapInvitationRow(row: Record<string, unknown>): Invitation {
  return {
    id: row['id'] as string,
    workspaceId: row['workspace_id'] as string,
    invitedEmail: row['invited_email'] as string,
    role: row['role'] as WorkspaceRole,
    token: row['token'] as string,
    status: row['status'] as Invitation['status'],
    invitedBy: row['invited_by'] as string,
    acceptedBy: row['accepted_by'] as string | null,
    expiresAt: row['expires_at'] as Date,
    createdAt: row['created_at'] as Date,
  }
}

async function writeAudit(client: PoolClient, event: {
  action: string; actor: string; workspaceId: string;
  resourceType: string; resourceId: string; before?: unknown; after?: unknown;
}): Promise<void> {
  const { createUlid } = await import('@zenith/shared')
  await client.query(
    `INSERT INTO public.audit_events (id, workspace_id, actor_id, action, resource_type, resource_id, before_json, after_json, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
    [createUlid(), event.workspaceId, event.actor, event.action, event.resourceType, event.resourceId,
     event.before ? JSON.stringify(event.before) : null, event.after ? JSON.stringify(event.after) : null]
  )
}
