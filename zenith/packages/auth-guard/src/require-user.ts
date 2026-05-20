import 'server-only';
// @ts-ignore - Ignore missing module until implemented if not existing
import { createClient } from '@app/shared/supabase/server';
import { ForbiddenError } from '@app/result';

export async function requireUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new ForbiddenError('Not authenticated');
  return { id: user.id, email: user.email! };
}
