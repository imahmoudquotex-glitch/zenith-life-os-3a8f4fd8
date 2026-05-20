import { withEnvelope, withIdempotency } from '@/lib/api-route';

export const POST = withEnvelope(async (_req, _ctx) => {
  withIdempotency(_req);
  return null;
});