import 'server-only';
import { withEnvelope, withIdempotency } from '@/lib/api-route';

export const POST = withEnvelope(async (req, _ctx) => {
  withIdempotency(req);
  const body = await req.json() as Record<string, unknown>;
  const { endpoint } = body;
  if (!endpoint) {
    return { error: 'missing_endpoint' };
  }
  // TODO: delete push_subscriptions record in W04+
  return { ok: true };
});
