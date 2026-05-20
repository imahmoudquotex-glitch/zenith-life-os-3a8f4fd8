import 'server-only';
// @ts-expect-error - ignored
import { createClient } from '@app/shared/supabase/server';
import { ForbiddenError } from '@app/result';
import { requireUser } from './require-user';

export async function requireWorkspace(workspaceId: string) {
  const user = await requireUser();
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users_workspaces')
    .select('role')
    .eq('user_id', user.id)
    .eq('workspace_id', workspaceId)
    .single();

  if (error || !data) throw new ForbiddenError('Not a member of this workspace');
  return { user, role: data.role };
}
