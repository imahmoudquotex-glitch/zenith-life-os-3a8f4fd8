/**
 * @zenith/pages — PageService
 * Core tree-based page management.
 * Enforces permissions and protects against infinite loops during moves.
 */

import type { PoolClient } from 'pg'
import { createUlid, ZenithError } from '@zenith/shared'
import { generateUniqueSlug, isReservedSlug } from '@zenith/workspaces'
import { PermissionsService } from '@zenith/permissions'

export interface Page {
  id: string
  workspaceId: string
  parentId: string | null
  title: string
  slug: string
  iconKind: string | null
  iconValue: string | null
  coverUrl: string | null
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreatePageInput {
  workspaceId: string
  parentId: string | null
  title: string
  slug?: string
}

export interface UpdatePageInput {
  title?: string
  slug?: string
  iconKind?: string | null
  iconValue?: string | null
  coverUrl?: string | null
}

export const PageService = {
  /**
   * Create a new page.
   */
  async createPage(
    client: PoolClient,
    input: CreatePageInput,
    actorId: string
  ): Promise<Page> {
    if (input.parentId) {
      // Must have at least 'edit' on parent to create a child
      await PermissionsService.requireAccess(client, input.workspaceId, input.parentId, actorId, 'edit')
    } else {
      // Must have workspace 'pages.create' capability to create root pages
      // (This should be checked in the API layer before calling createPage)
    }

    const id = createUlid()

    if (input.slug && isReservedSlug(input.slug)) {
      throw new ZenithError('DATA_004', 'Slug is reserved')
    }

    const slug = input.slug
      ? input.slug
      : await generateUniqueSlug(client, input.title || 'Untitled', 'pages', 'workspace_id', input.workspaceId)

    const result = await client.query(
      `INSERT INTO public.pages (id, workspace_id, parent_id, title, slug, created_by_user_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, workspace_id, parent_id, title, slug, icon_kind, icon_value, cover_url, is_deleted, created_at, updated_at`,
      [id, input.workspaceId, input.parentId, input.title || 'Untitled', slug, actorId]
    )

    await writeAudit(client, {
      action: 'page.created',
      actor: actorId,
      workspaceId: input.workspaceId,
      resourceType: 'page',
      resourceId: id,
      after: { title: input.title, parentId: input.parentId, slug },
    })

    return mapPageRow(result.rows[0])
  },

  /**
   * Get a single page.
   */
  async getPage(
    client: PoolClient,
    workspaceId: string,
    pageId: string,
    actorId: string
  ): Promise<Page> {
    await PermissionsService.requireAccess(client, workspaceId, pageId, actorId, 'view')

    const result = await client.query(
      `SELECT id, workspace_id, parent_id, title, slug, icon_kind, icon_value, cover_url, is_deleted, created_at, updated_at
       FROM public.pages WHERE id = $1 AND workspace_id = $2`,
      [pageId, workspaceId]
    )

    if (result.rows.length === 0) {
      throw new ZenithError('DATA_001', 'Page not found')
    }

    return mapPageRow(result.rows[0])
  },

  /**
   * Update page metadata.
   */
  async updatePage(
    client: PoolClient,
    workspaceId: string,
    pageId: string,
    patch: UpdatePageInput,
    actorId: string
  ): Promise<Page> {
    await PermissionsService.requireAccess(client, workspaceId, pageId, actorId, 'edit')

    const before = await PageService.getPage(client, workspaceId, pageId, actorId)

    if (before.isDeleted) {
      throw new ZenithError('DATA_004', 'Cannot update archived page')
    }

    if (patch.slug && isReservedSlug(patch.slug)) {
      throw new ZenithError('DATA_004', 'Slug is reserved')
    }

    const sets: string[] = []
    const vals: unknown[] = []
    let idx = 1

    const addField = (col: string, val: unknown) => {
      sets.push(`${col} = $${idx}`)
      vals.push(val)
      idx++
    }

    if (patch.title !== undefined) addField('title', patch.title)
    if (patch.slug !== undefined) addField('slug', patch.slug)
    if (patch.iconKind !== undefined) addField('icon_kind', patch.iconKind)
    if (patch.iconValue !== undefined) addField('icon_value', patch.iconValue)
    if (patch.coverUrl !== undefined) addField('cover_url', patch.coverUrl)

    if (sets.length === 0) return before

    vals.push(pageId, workspaceId)
    const result = await client.query(
      `UPDATE public.pages SET ${sets.join(', ')}, updated_at = NOW()
       WHERE id = $${idx} AND workspace_id = $${idx + 1}
       RETURNING id, workspace_id, parent_id, title, slug, icon_kind, icon_value, cover_url, is_deleted, created_at, updated_at`,
      vals
    )

    await writeAudit(client, {
      action: 'page.updated',
      actor: actorId,
      workspaceId,
      resourceType: 'page',
      resourceId: pageId,
      before: { title: before.title, slug: before.slug },
      after: patch,
    })

    return mapPageRow(result.rows[0])
  },

  /**
   * Move a page. Protects against setting a page as its own descendant.
   */
  async movePage(
    client: PoolClient,
    workspaceId: string,
    pageId: string,
    newParentId: string | null,
    actorId: string
  ): Promise<void> {
    const page = await PageService.getPage(client, workspaceId, pageId, actorId)

    if (page.parentId === newParentId) return // No-op

    // Require 'edit' on the page itself
    await PermissionsService.requireAccess(client, workspaceId, pageId, actorId, 'edit')

    // If moving INTO a new parent, require 'edit' on the new parent
    if (newParentId) {
      await PermissionsService.requireAccess(client, workspaceId, newParentId, actorId, 'edit')

      // LOOP PREVENTION: Ensure new parent is not a descendant of this page
      const descRes = await client.query(
        `SELECT id FROM public.page_descendants($1, 100) WHERE id = $2`,
        [pageId, newParentId]
      )
      if (descRes.rows.length > 0) {
        throw new ZenithError('DATA_003', 'Cannot move a page into its own descendant')
      }
    }

    await client.query(
      `UPDATE public.pages SET parent_id = $1, updated_at = NOW() WHERE id = $2 AND workspace_id = $3`,
      [newParentId, pageId, workspaceId]
    )

    await writeAudit(client, {
      action: 'page.moved',
      actor: actorId,
      workspaceId,
      resourceType: 'page',
      resourceId: pageId,
      before: { parentId: page.parentId },
      after: { parentId: newParentId },
    })
  },

  /**
   * Archive a page and all its descendants.
   */
  async archivePage(
    client: PoolClient,
    workspaceId: string,
    pageId: string,
    actorId: string
  ): Promise<void> {
    await PermissionsService.requireAccess(client, workspaceId, pageId, actorId, 'edit')

    // Get all descendants to cascade archive
    const descRes = await client.query(`SELECT id FROM public.page_descendants($1, 100)`, [pageId])
    const ids = [pageId, ...descRes.rows.map(r => r.id)]

    await client.query(
      `UPDATE public.pages SET is_deleted = TRUE, deleted_at = NOW(), updated_at = NOW()
       WHERE id = ANY($1) AND workspace_id = $2`,
      [ids, workspaceId]
    )

    await writeAudit(client, {
      action: 'page.archived',
      actor: actorId,
      workspaceId,
      resourceType: 'page',
      resourceId: pageId,
      after: { cascadedTo: ids.length - 1 },
    })
  },

  /**
   * Get workspace page tree (active pages only).
   */
  async getPageTree(client: PoolClient, workspaceId: string): Promise<Page[]> {
    const result = await client.query(
      `SELECT id, workspace_id, parent_id, title, slug, icon_kind, icon_value, cover_url, is_deleted, created_at, updated_at
       FROM public.pages
       WHERE workspace_id = $1 AND is_deleted = FALSE
       ORDER BY created_at ASC`,
      [workspaceId]
    )

    return result.rows.map(mapPageRow)
  }
}

function mapPageRow(row: Record<string, unknown>): Page {
  return {
    id: row['id'] as string,
    workspaceId: row['workspace_id'] as string,
    parentId: row['parent_id'] as string | null,
    title: row['title'] as string,
    slug: row['slug'] as string,
    iconKind: row['icon_kind'] as string | null,
    iconValue: row['icon_value'] as string | null,
    coverUrl: row['cover_url'] as string | null,
    isDeleted: row['is_deleted'] as boolean,
    createdAt: row['created_at'] as Date,
    updatedAt: row['updated_at'] as Date,
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
