/* eslint-disable @typescript-eslint/no-unused-vars */
import 'server-only';
import { withEnvelope, withIdempotency } from '@/lib/api-route';

export const POST = withEnvelope(async (req, _ctx) => {
  withIdempotency(req);
  const body = await req.json() as Record<string, unknown>;
  const { endpoint, p256dh, auth } = body;
  if (!endpoint || !p256dh || !auth) {
    return { error: 'missing_fields' };
  }
  // TODO: persist to push_subscriptions table in W04+ with auth guard
  return { ok: true };
});
