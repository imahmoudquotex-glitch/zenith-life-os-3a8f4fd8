import 'server-only';
import { withEnvelope, withIdempotency } from '@/lib/api-route';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createUlid } from '@zenith/shared';
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
  const { endpoint, p256dh, auth } = body;

  if (
    typeof endpoint !== 'string' || !endpoint ||
    typeof p256dh !== 'string' || !p256dh ||
    typeof auth !== 'string' || !auth
  ) {
    throw new ZenithError('DATA_001', 'Missing required fields: endpoint, p256dh, auth', 400, false);
  }

  const admin = createAdminClient();

  // Upsert subscription (endpoint is unique per user)
  const { error } = await admin.from('push_subscriptions').upsert(
    {
      id: createUlid(),
      user_id: user.id,
      endpoint,
      p256dh,
      auth_key: auth,
      user_agent: req.headers.get('user-agent') ?? null,
      last_seen_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id,endpoint',
      ignoreDuplicates: false,
    },
  );

  if (error) {
    console.error('[push/subscribe] upsert failed:', error.message, { requestId });
    throw new ZenithError('SYS_001', 'Failed to save subscription', 500, true);
  }

  return { ok: true };
});
