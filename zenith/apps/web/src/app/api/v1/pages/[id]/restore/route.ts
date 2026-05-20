import { withEnvelope, withIdempotency } from '@/lib/api-route';

export const GET = withEnvelope(async (_req, _ctx) => {
  return null;
});

export const POST = withEnvelope(async (_req, _ctx) => {
  withIdempotency(_req);
  return null;
});

export const PATCH = withEnvelope(async (_req, _ctx) => {
  withIdempotency(_req);
  return null;
});

export const DELETE = withEnvelope(async (_req, _ctx) => {
  withIdempotency(_req);
  return null;
});