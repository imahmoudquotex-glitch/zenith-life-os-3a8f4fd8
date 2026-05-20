/**
 * @zenith/auth — Public API
 * Wave 02: Auth kernel package.
 */

export { createServerSupabaseClient } from './server'
export { getSupabaseBrowserClient } from './client'
export { getCurrentUser, requireUser, requireVerifiedUser } from './session'
export type { SessionUser } from './session'
export { withWorkspaceContext, withUserContext } from './workspace-context'
export { requireMembership, requireCapability, getCapabilitiesForRole, defaultLevelForRole, ROLE_CAPABILITIES } from './guards'
export type { WorkspaceRole, Capability } from './guards'
