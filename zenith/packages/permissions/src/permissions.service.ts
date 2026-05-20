/**
 * @zenith/permissions — PermissionsService
 * Additive page-level permission overrides.
 */

import type { PoolClient } from 'pg'
import { createUlid, ZenithError } from '@zenith/shared'
import { defaultLevelForRole, type WorkspaceRole } from '@zenith/auth'

export type AccessLevel = 'none' | 'view' | 'comment' | 'edit' | 'full'

export interface PagePermission {
  id: string
  workspaceId: string
  pageId: string
  subjectType: 'user' | 'role' | 'workspace_everyone'
  subjectUserId: string | null
  subjectRole: WorkspaceRole | null
  level: AccessLevel
}

// Convert level string to numeric weight for comparison
const LEVEL_WEIGHT: Record<AccessLevel, number> = {
  none: 0,
  view: 1,
  comment: 2,
  edit: 3,
  full: 4,
}

export const PermissionsService = {
  /**
   * Determine effective access level for a user on a page.
   * Additive model: max(workspace_role_default, workspace_everyone, role_override, user_override)
   */
  async getEffectiveAccess(
    client: PoolClient,
    workspaceId: string,
    pageId: string,
    userId: string
  ): Promise<AccessLevel> {
    // 1. Get user's base workspace role
    const memberRes = await client.query(
      `SELECT role FROM public.users_workspaces WHERE user_id = $1 AND workspace_id = $2 AND is_deleted = FALSE`,
      [userId, workspaceId]
    )

    if (memberRes.rows.length === 0) {
      return 'none'
    }

    const baseRole = memberRes.rows[0].role as WorkspaceRole
    const baseLevel = defaultLevelForRole(baseRole)

    // 2. Fetch page-level overrides
    const overrides = await client.query(
      `SELECT subject_type, subject_user_id, subject_role, level
       FROM public.page_permissions
       WHERE workspace_id = $1 AND page_id = $2 AND (
         subject_type = 'workspace_everyone'
         OR (subject_type = 'role' AND subject_role = $3)
         OR (subject_type = 'user' AND subject_user_id = $4)
       )`,
      [workspaceId, pageId, baseRole, userId]
    )

    let effectiveWeight = LEVEL_WEIGHT[baseLevel]

    for (const row of overrides.rows) {
      const w = LEVEL_WEIGHT[row.level as AccessLevel]
      if (w > effectiveWeight) {
        effectiveWeight = w
      }
    }

    // Convert weight back to string
    return (Object.keys(LEVEL_WEIGHT) as AccessLevel[]).find(k => LEVEL_WEIGHT[k] === effectiveWeight) || 'none'
  },

  /**
   * Require minimum access level. Throws if insufficient.
   */
  async requireAccess(
    client: PoolClient,
    workspaceId: string,
    pageId: string,
    userId: string,
    required: AccessLevel
  ): Promise<AccessLevel> {
    const effective = await PermissionsService.getEffectiveAccess(client, workspaceId, pageId, userId)
    if (LEVEL_WEIGHT[effective] < LEVEL_WEIGHT[required]) {
      throw new ZenithError('AUTH_003', `Requires ${required} access on page, but has ${effective}`)
    }
    return effective
  },

  /**
   * Set a user override.
   */
  async setUserOverride(
    client: PoolClient,
    workspaceId: string,
    pageId: string,
    targetUserId: string,
    level: Exclude<AccessLevel, 'none'>,
    actorId: string
  ): Promise<void> {
    await PermissionsService.requireAccess(client, workspaceId, pageId, actorId, 'full')

    await client.query(
      `INSERT INTO public.page_permissions (id, workspace_id, page_id, subject_type, subject_user_id, level, created_by_user_id)
       VALUES ($1, $2, $3, 'user', $4, $5, $6)
       ON CONFLICT (page_id, subject_user_id) WHERE subject_type = 'user'
       DO UPDATE SET level = $5, updated_at = NOW()`,
      [createUlid(), workspaceId, pageId, targetUserId, level, actorId]
    )

    await writeAudit(client, {
      action: 'page.permission_added',
      actor: actorId,
      workspaceId,
      resourceType: 'page',
      resourceId: pageId,
      after: { subjectType: 'user', subjectUserId: targetUserId, level },
    })
  },

  /**
   * Set a role override.
   */
  async setRoleOverride(
    client: PoolClient,
    workspaceId: string,
    pageId: string,
    targetRole: WorkspaceRole,
    level: Exclude<AccessLevel, 'none'>,
    actorId: string
  ): Promise<void> {
    await PermissionsService.requireAccess(client, workspaceId, pageId, actorId, 'full')

    await client.query(
      `INSERT INTO public.page_permissions (id, workspace_id, page_id, subject_type, subject_role, level, created_by_user_id)
       VALUES ($1, $2, $3, 'role', $4, $5, $6)
       ON CONFLICT (page_id, subject_role) WHERE subject_type = 'role'
       DO UPDATE SET level = $5, updated_at = NOW()`,
      [createUlid(), workspaceId, pageId, targetRole, level, actorId]
    )

    await writeAudit(client, {
      action: 'page.permission_added',
      actor: actorId,
      workspaceId,
      resourceType: 'page',
      resourceId: pageId,
      after: { subjectType: 'role', subjectRole: targetRole, level },
    })
  },

  /**
   * Set workspace everyone override.
   */
  async setEveryoneOverride(
    client: PoolClient,
    workspaceId: string,
    pageId: string,
    level: Exclude<AccessLevel, 'none'>,
    actorId: string
  ): Promise<void> {
    await PermissionsService.requireAccess(client, workspaceId, pageId, actorId, 'full')

    await client.query(
      `INSERT INTO public.page_permissions (id, workspace_id, page_id, subject_type, level, created_by_user_id)
       VALUES ($1, $2, $3, 'workspace_everyone', $4, $5)
       ON CONFLICT (page_id) WHERE subject_type = 'workspace_everyone'
       DO UPDATE SET level = $4, updated_at = NOW()`,
      [createUlid(), workspaceId, pageId, level, actorId]
    )

    await writeAudit(client, {
      action: 'page.permission_added',
      actor: actorId,
      workspaceId,
      resourceType: 'page',
      resourceId: pageId,
      after: { subjectType: 'workspace_everyone', level },
    })
  },

  /**
   * Remove a permission override by ID.
   */
  async removeOverride(
    client: PoolClient,
    workspaceId: string,
    pageId: string,
    permissionId: string,
    actorId: string
  ): Promise<void> {
    await PermissionsService.requireAccess(client, workspaceId, pageId, actorId, 'full')

    const res = await client.query(
      `DELETE FROM public.page_permissions WHERE id = $1 AND workspace_id = $2 AND page_id = $3 RETURNING subject_type, subject_user_id, subject_role`,
      [permissionId, workspaceId, pageId]
    )

    if (res.rows.length > 0) {
      await writeAudit(client, {
        action: 'page.permission_removed',
        actor: actorId,
        workspaceId,
        resourceType: 'page',
        resourceId: pageId,
        before: { permissionId, subjectType: res.rows[0].subject_type },
      })
    }
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
