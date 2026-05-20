/**
 * @zenith/auth — Guards
 * Authorization guards for route handlers.
 * Check membership and capabilities before business logic.
 */

import type { PoolClient } from 'pg'
import { ZenithError } from '@zenith/shared'

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer'

export type Capability =
  | 'workspace.view'
  | 'workspace.update'
  | 'workspace.delete'
  | 'workspace.transfer'
  | 'members.view'
  | 'members.invite'
  | 'members.change_role'
  | 'members.remove'
  | 'pages.view'
  | 'pages.create'
  | 'pages.update'
  | 'pages.move'
  | 'pages.archive'
  | 'pages.delete'

/**
 * Capability map — which roles have which capabilities.
 * Additive: higher roles include all lower role capabilities.
 */
const ROLE_CAPABILITIES: Record<WorkspaceRole, ReadonlySet<Capability>> = {
  owner: new Set<Capability>([
    'workspace.view', 'workspace.update', 'workspace.delete', 'workspace.transfer',
    'members.view', 'members.invite', 'members.change_role', 'members.remove',
    'pages.view', 'pages.create', 'pages.update', 'pages.move', 'pages.archive', 'pages.delete',
  ]),
  admin: new Set<Capability>([
    'workspace.view', 'workspace.update',
    'members.view', 'members.invite', 'members.change_role', 'members.remove',
    'pages.view', 'pages.create', 'pages.update', 'pages.move', 'pages.archive', 'pages.delete',
  ]),
  member: new Set<Capability>([
    'workspace.view',
    'members.view',
    'pages.view', 'pages.create', 'pages.update', 'pages.move', 'pages.archive',
  ]),
  viewer: new Set<Capability>([
    'workspace.view',
    'members.view',
    'pages.view',
  ]),
}

/**
 * Check if a user is a member of the workspace. Returns their role.
 * Throws PERMISSION_DENIED if not a member.
 */
export async function requireMembership(
  client: PoolClient,
  userId: string,
  workspaceId: string
): Promise<WorkspaceRole> {
  const result = await client.query(
    `SELECT role FROM public.users_workspaces
     WHERE user_id = $1 AND workspace_id = $2 AND is_deleted = FALSE`,
    [userId, workspaceId]
  )

  if (result.rows.length === 0) {
    throw new ZenithError('AUTH_003', 'Not a member of this workspace')
  }

  return result.rows[0].role as WorkspaceRole
}

/**
 * Check if a user has a specific capability in the workspace.
 * Throws PERMISSION_DENIED if they don't.
 */
export async function requireCapability(
  client: PoolClient,
  userId: string,
  workspaceId: string,
  capability: Capability
): Promise<WorkspaceRole> {
  const role = await requireMembership(client, userId, workspaceId)

  if (!ROLE_CAPABILITIES[role].has(capability)) {
    throw new ZenithError('AUTH_003', `Role "${role}" lacks capability "${capability}"`)
  }

  return role
}

/**
 * Get capabilities for a role (for client-side permission display).
 */
export function getCapabilitiesForRole(role: WorkspaceRole): ReadonlySet<Capability> {
  return ROLE_CAPABILITIES[role]
}

/**
 * Default page access level for a workspace role.
 */
export function defaultLevelForRole(role: WorkspaceRole): 'none' | 'view' | 'comment' | 'edit' | 'full' {
  switch (role) {
    case 'owner': return 'full'
    case 'admin': return 'full'
    case 'member': return 'edit'
    case 'viewer': return 'view'
    default: return 'none'
  }
}

export { ROLE_CAPABILITIES }
