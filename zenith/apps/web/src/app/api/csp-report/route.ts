import 'server-only';
import { withEnvelope, withIdempotency } from '@/lib/api-route';

export const POST = withEnvelope(async (req, _ctx) => {
  withIdempotency(req);
  const body = await req.json() as Record<string, unknown>;
  const report = body['csp-report'] ?? body;
  // TODO: insert into csp_reports table via service-role client in W04+
  void report;
  return { ok: true };
});
