import 'server-only';
import { withEnvelope, withIdempotency } from '@/lib/api-route';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ZenithError } from '@zenith/shared';

export const POST = withEnvelope(async (req, _ctx, requestId) => {
  withIdempotency(req);

  // Require authenticated user
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new ZenithError('AUTH_001', 'Authentication required', 401, false);
  }

  const body = await req.json() as Record<string, unknown>;
  const { endpoint } = body;

  if (typeof endpoint !== 'string' || !endpoint) {
    throw new ZenithError('DATA_001', 'Missing required field: endpoint', 400, false);
  }

  const admin = createAdminClient();

  // Soft-revoke by setting revoked_at (keep for audit trail)
  const { error } = await admin
    .from('push_subscriptions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('endpoint', endpoint)
    .is('revoked_at', null);

  if (error) {
    console.error('[push/unsubscribe] update failed:', error.message, { requestId });
    throw new ZenithError('SYS_001', 'Failed to revoke subscription', 500, true);
  }

  return { ok: true };
});
