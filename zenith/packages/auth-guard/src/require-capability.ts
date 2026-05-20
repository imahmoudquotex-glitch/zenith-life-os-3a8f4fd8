import 'server-only';
import { ForbiddenError } from '@app/result';
import { requireWorkspace } from './require-workspace';

const ROLE_CAPS: Record<string, string[]> = {
  owner: ['workspace.delete', 'billing.manage', 'members.invite'],
  admin: ['members.invite'],
  member: [],
  viewer: []
};

export async function requireCapability(workspaceId: string, capability: string) {
  const { user, role } = await requireWorkspace(workspaceId);
  const caps = ROLE_CAPS[role] || [];
  if (role !== 'owner' && !caps.includes(capability)) {
    throw new ForbiddenError(`Missing capability: ${capability}`);
  }
  return { user, role };
}
