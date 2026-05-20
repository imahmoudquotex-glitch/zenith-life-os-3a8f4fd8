/**
 * @zenith/workspaces — WorkspaceService
 * Core workspace CRUD with audit logging.
 * All mutations go through this service — never direct DB calls.
 */

import type { PoolClient } from 'pg'
import { createUlid, ZenithError } from '@zenith/shared'
import { generateUniqueSlug, isReservedSlug } from './slug'

// ─── Types ────────────────────────────────────────────────

export interface Workspace {
  id: string
  slug: string
  name: string
  ownerUserId: string
  plan: string
  iconKind: string | null
  iconValue: string | null
  description: string | null
  bannerUrl: string | null
  timezone: string
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateWorkspaceInput {
  userId: string
  name: string
  slug?: string
}

export interface UpdateWorkspaceInput {
  name?: string
  slug?: string
  iconKind?: string | null
  iconValue?: string | null
  description?: string | null
  bannerUrl?: string | null
  timezone?: string
}

// ─── Service ──────────────────────────────────────────────

export const WorkspaceService = {
  /**
   * Create a new workspace + make the creator the owner.
   */
  async createWorkspace(client: PoolClient, input: CreateWorkspaceInput): Promise<Workspace> {
    const id = createUlid()

    // Validate slug if provided
    if (input.slug && isReservedSlug(input.slug)) {
      throw new ZenithError('WS_003', 'Slug is reserved')
    }

    const slug = input.slug
      ? input.slug
      : await generateUniqueSlug(client, input.name, 'workspaces')

    // Insert workspace
    const result = await client.query(
      `INSERT INTO public.workspaces (id, slug, name, owner_user_id, plan, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'free', NOW(), NOW())
       RETURNING id, slug, name, owner_user_id, plan, icon_kind, icon_value, description, banner_url, timezone, is_deleted, created_at, updated_at`,
      [id, slug, input.name, input.userId]
    )

    // Make creator the owner
    await client.query(
      `INSERT INTO public.users_workspaces (user_id, workspace_id, role, joined_at)
       VALUES ($1, $2, 'owner', NOW())`,
      [input.userId, id]
    )

    // Audit
    await writeAudit(client, {
      action: 'workspace.created',
      actor: input.userId,
      workspaceId: id,
      resourceType: 'workspace',
      resourceId: id,
      after: { name: input.name, slug },
    })

    return mapRow(result.rows[0])
  },

  /**
   * Ensure user has a personal workspace — idempotent.
   */
  async ensurePersonalWorkspace(client: PoolClient, userId: string): Promise<Workspace> {
    // Check if user already has an owned workspace
    const existing = await client.query(
      `SELECT w.id, w.slug, w.name, w.owner_user_id, w.plan, w.icon_kind, w.icon_value,
              w.description, w.banner_url, w.timezone, w.is_deleted, w.created_at, w.updated_at
       FROM public.workspaces w
       JOIN public.users_workspaces uw ON uw.workspace_id = w.id
       WHERE uw.user_id = $1 AND uw.role = 'owner' AND w.is_deleted = FALSE
       ORDER BY w.created_at ASC
       LIMIT 1`,
      [userId]
    )

    if (existing.rows.length > 0) {
      return mapRow(existing.rows[0])
    }

    // Get user info for naming
    const userRow = await client.query(
      `SELECT display_name, email FROM public.users WHERE id = $1`,
      [userId]
    )
    const displayName = userRow.rows[0]?.display_name || 'My'

    return WorkspaceService.createWorkspace(client, {
      userId,
      name: `${displayName}'s Workspace`,
    })
  },

  /**
   * Get workspace by ID.
   */
  async getWorkspace(client: PoolClient, id: string): Promise<Workspace> {
    const result = await client.query(
      `SELECT id, slug, name, owner_user_id, plan, icon_kind, icon_value,
              description, banner_url, timezone, is_deleted, created_at, updated_at
       FROM public.workspaces WHERE id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      throw new ZenithError('WS_001')
    }

    return mapRow(result.rows[0])
  },

  /**
   * List workspaces for a user (cursor-paginated).
   */
  async listUserWorkspaces(
    client: PoolClient,
    userId: string,
    cursor?: string,
    limit: number = 20
  ): Promise<{ items: Workspace[]; nextCursor: string | null }> {
    const params: (string | number)[] = [userId, limit + 1]
    let query = `
      SELECT w.id, w.slug, w.name, w.owner_user_id, w.plan, w.icon_kind, w.icon_value,
             w.description, w.banner_url, w.timezone, w.is_deleted, w.created_at, w.updated_at
      FROM public.workspaces w
      JOIN public.users_workspaces uw ON uw.workspace_id = w.id
      WHERE uw.user_id = $1 AND uw.is_deleted = FALSE AND w.is_deleted = FALSE`

    if (cursor) {
      query += ` AND w.created_at < $3`
      params.push(cursor)
    }

    query += ` ORDER BY w.created_at DESC LIMIT $2`

    const result = await client.query(query, params)
    const hasMore = result.rows.length > limit
    const items = result.rows.slice(0, limit).map(mapRow)
    const nextCursor = hasMore ? (items[items.length - 1]?.createdAt.toISOString() ?? null) : null

    return { items, nextCursor }
  },

  /**
   * Update workspace fields.
   */
  async updateWorkspace(
    client: PoolClient,
    id: string,
    patch: UpdateWorkspaceInput,
    actorId: string
  ): Promise<Workspace> {
    const before = await WorkspaceService.getWorkspace(client, id)

    if (before.isDeleted) {
      throw new ZenithError('WS_001', 'Workspace is archived')
    }

    // Validate slug if changing
    if (patch.slug && isReservedSlug(patch.slug)) {
      throw new ZenithError('WS_003', 'Slug is reserved')
    }

    const sets: string[] = []
    const vals: unknown[] = []
    let idx = 1

    const addField = (col: string, val: unknown) => {
      sets.push(`${col} = $${idx}`)
      vals.push(val)
      idx++
    }

    if (patch.name !== undefined) addField('name', patch.name)
    if (patch.slug !== undefined) addField('slug', patch.slug)
    if (patch.iconKind !== undefined) addField('icon_kind', patch.iconKind)
    if (patch.iconValue !== undefined) addField('icon_value', patch.iconValue)
    if (patch.description !== undefined) addField('description', patch.description)
    if (patch.bannerUrl !== undefined) addField('banner_url', patch.bannerUrl)
    if (patch.timezone !== undefined) addField('timezone', patch.timezone)

    if (sets.length === 0) return before

    vals.push(id)
    const result = await client.query(
      `UPDATE public.workspaces SET ${sets.join(', ')}, updated_at = NOW()
       WHERE id = $${idx}
       RETURNING id, slug, name, owner_user_id, plan, icon_kind, icon_value, description, banner_url, timezone, is_deleted, created_at, updated_at`,
      vals
    )

    await writeAudit(client, {
      action: 'workspace.updated',
      actor: actorId,
      workspaceId: id,
      resourceType: 'workspace',
      resourceId: id,
      before: { name: before.name, slug: before.slug },
      after: patch,
    })

    return mapRow(result.rows[0])
  },

  /**
   * Soft-archive a workspace.
   */
  async archiveWorkspace(client: PoolClient, id: string, actorId: string): Promise<void> {
    await client.query(
      `UPDATE public.workspaces SET is_deleted = TRUE, deleted_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [id]
    )

    await writeAudit(client, {
      action: 'workspace.archived',
      actor: actorId,
      workspaceId: id,
      resourceType: 'workspace',
      resourceId: id,
    })
  },

  /**
   * Restore an archived workspace.
   */
  async restoreWorkspace(client: PoolClient, id: string, actorId: string): Promise<void> {
    await client.query(
      `UPDATE public.workspaces SET is_deleted = FALSE, deleted_at = NULL, updated_at = NOW() WHERE id = $1`,
      [id]
    )

    await writeAudit(client, {
      action: 'workspace.restored',
      actor: actorId,
      workspaceId: id,
      resourceType: 'workspace',
      resourceId: id,
    })
  },

  /**
   * Transfer workspace ownership.
   * Uses SELECT FOR UPDATE to prevent concurrent transfers.
   */
  async transferOwnership(
    client: PoolClient,
    workspaceId: string,
    fromUserId: string,
    toUserId: string
  ): Promise<void> {
    // Lock workspace row
    await client.query(
      `SELECT id FROM public.workspaces WHERE id = $1 FOR UPDATE`,
      [workspaceId]
    )

    // Verify current owner
    const ws = await WorkspaceService.getWorkspace(client, workspaceId)
    if (ws.ownerUserId !== fromUserId) {
      throw new ZenithError('AUTH_003', 'Only the owner can transfer ownership')
    }

    // Verify target is a member
    const targetMembership = await client.query(
      `SELECT role FROM public.users_workspaces WHERE user_id = $1 AND workspace_id = $2 AND is_deleted = FALSE`,
      [toUserId, workspaceId]
    )
    if (targetMembership.rows.length === 0) {
      throw new ZenithError('AUTH_003', 'Target user is not a member')
    }

    // Transfer
    await client.query(
      `UPDATE public.workspaces SET owner_user_id = $1, updated_at = NOW() WHERE id = $2`,
      [toUserId, workspaceId]
    )

    // New owner gets 'owner' role
    await client.query(
      `UPDATE public.users_workspaces SET role = 'owner', updated_at = NOW()
       WHERE user_id = $1 AND workspace_id = $2`,
      [toUserId, workspaceId]
    )

    // Previous owner becomes 'admin'
    await client.query(
      `UPDATE public.users_workspaces SET role = 'admin', updated_at = NOW()
       WHERE user_id = $1 AND workspace_id = $2`,
      [fromUserId, workspaceId]
    )

    await writeAudit(client, {
      action: 'workspace.ownership_transferred',
      actor: fromUserId,
      workspaceId,
      resourceType: 'workspace',
      resourceId: workspaceId,
      before: { owner: fromUserId },
      after: { owner: toUserId },
    })
  },
}

// ─── Helpers ──────────────────────────────────────────────

function mapRow(row: Record<string, unknown>): Workspace {
  return {
    id: row['id'] as string,
    slug: row['slug'] as string,
    name: row['name'] as string,
    ownerUserId: row['owner_user_id'] as string,
    plan: row['plan'] as string,
    iconKind: row['icon_kind'] as string | null,
    iconValue: row['icon_value'] as string | null,
    description: row['description'] as string | null,
    bannerUrl: row['banner_url'] as string | null,
    timezone: row['timezone'] as string,
    isDeleted: row['is_deleted'] as boolean,
    createdAt: row['created_at'] as Date,
    updatedAt: row['updated_at'] as Date,
  }
}

async function writeAudit(
  client: PoolClient,
  event: {
    action: string
    actor: string
    workspaceId: string
    resourceType: string
    resourceId: string
    before?: unknown
    after?: unknown
  }
): Promise<void> {
  const { createUlid } = await import('@zenith/shared')
  await client.query(
    `INSERT INTO public.audit_events (id, workspace_id, actor_id, action, resource_type, resource_id, before_json, after_json, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
    [
      createUlid(),
      event.workspaceId,
      event.actor,
      event.action,
      event.resourceType,
      event.resourceId,
      event.before ? JSON.stringify(event.before) : null,
      event.after ? JSON.stringify(event.after) : null,
    ]
  )
}
