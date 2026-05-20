/**
 * @zenith/workspaces — MembershipService
 * Manage workspace members: list, change role, remove.
 * Enforces: last owner cannot be removed.
 */

import type { PoolClient } from 'pg'
import { ZenithError } from '@zenith/shared'
import type { WorkspaceRole } from '@zenith/auth'

export interface Member {
  userId: string
  workspaceId: string
  role: WorkspaceRole
  displayName: string | null
  email: string
  avatarUrl: string | null
  joinedAt: Date
  lastActiveAt: Date | null
}

export const MembershipService = {
  /**
   * List members of a workspace (cursor-paginated).
   */
  async listMembers(
    client: PoolClient,
    workspaceId: string,
    cursor?: string,
    limit: number = 20
  ): Promise<{ items: Member[]; nextCursor: string | null }> {
    const params: (string | number)[] = [workspaceId, limit + 1]
    let query = `
      SELECT uw.user_id, uw.workspace_id, uw.role, uw.joined_at, uw.last_active_at,
             u.display_name, u.email, u.avatar_url
      FROM public.users_workspaces uw
      JOIN public.users u ON u.id = uw.user_id
      WHERE uw.workspace_id = $1 AND uw.is_deleted = FALSE`

    if (cursor) {
      query += ` AND uw.joined_at < $3`
      params.push(cursor)
    }

    query += ` ORDER BY uw.joined_at DESC LIMIT $2`

    const result = await client.query(query, params)
    const hasMore = result.rows.length > limit
    const items = result.rows.slice(0, limit).map(mapMemberRow)
    const nextCursor = hasMore ? (items[items.length - 1]?.joinedAt.toISOString() ?? null) : null

    return { items, nextCursor }
  },

  /**
   * Get a single membership.
   */
  async getMembership(client: PoolClient, workspaceId: string, userId: string): Promise<Member> {
    const result = await client.query(
      `SELECT uw.user_id, uw.workspace_id, uw.role, uw.joined_at, uw.last_active_at,
              u.display_name, u.email, u.avatar_url
       FROM public.users_workspaces uw
       JOIN public.users u ON u.id = uw.user_id
       WHERE uw.workspace_id = $1 AND uw.user_id = $2 AND uw.is_deleted = FALSE`,
      [workspaceId, userId]
    )

    if (result.rows.length === 0) {
      throw new ZenithError('DATA_001', 'Membership not found')
    }

    return mapMemberRow(result.rows[0])
  },

  /**
   * Change a member's role.
   * Cannot change owner role directly — use transferOwnership instead.
   */
  async changeRole(
    client: PoolClient,
    workspaceId: string,
    targetUserId: string,
    newRole: WorkspaceRole,
    actorId: string
  ): Promise<void> {
    // Get current role
    const current = await MembershipService.getMembership(client, workspaceId, targetUserId)

    if (current.role === 'owner') {
      throw new ZenithError('AUTH_003', 'Cannot change owner role — use transfer ownership')
    }

    if (newRole === 'owner') {
      throw new ZenithError('AUTH_003', 'Cannot promote to owner — use transfer ownership')
    }

    await client.query(
      `UPDATE public.users_workspaces SET role = $1, updated_at = NOW()
       WHERE user_id = $2 AND workspace_id = $3`,
      [newRole, targetUserId, workspaceId]
    )

    await writeAudit(client, {
      action: 'workspace.member.role_changed',
      actor: actorId,
      workspaceId,
      resourceType: 'membership',
      resourceId: targetUserId,
      before: { role: current.role },
      after: { role: newRole },
    })
  },

  /**
   * Remove a member from a workspace.
   * Cannot remove the last owner.
   */
  async removeMember(
    client: PoolClient,
    workspaceId: string,
    targetUserId: string,
    actorId: string
  ): Promise<void> {
    const member = await MembershipService.getMembership(client, workspaceId, targetUserId)

    // Check if removing the last owner
    if (member.role === 'owner') {
      const ownerCount = await client.query(
        `SELECT COUNT(*) AS cnt FROM public.users_workspaces
         WHERE workspace_id = $1 AND role = 'owner' AND is_deleted = FALSE`,
        [workspaceId]
      )
      if (parseInt(ownerCount.rows[0].cnt, 10) <= 1) {
        throw new ZenithError('WS_003', 'Cannot remove the last owner')
      }
    }

    await client.query(
      `UPDATE public.users_workspaces SET is_deleted = TRUE, deleted_at = NOW(), updated_at = NOW()
       WHERE user_id = $1 AND workspace_id = $2`,
      [targetUserId, workspaceId]
    )

    await writeAudit(client, {
      action: 'workspace.member.removed',
      actor: actorId,
      workspaceId,
      resourceType: 'membership',
      resourceId: targetUserId,
      before: { role: member.role },
    })
  },
}

function mapMemberRow(row: Record<string, unknown>): Member {
  return {
    userId: row['user_id'] as string,
    workspaceId: row['workspace_id'] as string,
    role: row['role'] as WorkspaceRole,
    displayName: row['display_name'] as string | null,
    email: row['email'] as string,
    avatarUrl: row['avatar_url'] as string | null,
    joinedAt: row['joined_at'] as Date,
    lastActiveAt: row['last_active_at'] as Date | null,
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
