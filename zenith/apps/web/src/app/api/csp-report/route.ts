import 'server-only';
import { withEnvelope } from '@/lib/api-route';
import { createAdminClient } from '@/lib/supabase/admin';
import { createUlid } from '@zenith/shared';
import { redactPii } from '@zenith/security';

/**
 * POST /api/csp-report
 * Receives CSP violation reports from browser report-uri directive.
 * Inserts into csp_reports table via service-role client (bypasses RLS).
 * Does NOT require authentication — CSP reports fire before session is available.
 */
export const POST = withEnvelope(async (req, _ctx) => {
  const body = await req.json() as Record<string, unknown>;
  const report = (body['csp-report'] ?? body) as Record<string, unknown>;

  const supabase = createAdminClient();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

  // Redact PII from blocked-uri and document-uri before storing
  const safeDocUri = report['document-uri']
    ? redactPii(String(report['document-uri']))
    : null;
  const safeBlockedUri = report['blocked-uri']
    ? redactPii(String(report['blocked-uri']))
    : null;

  const { error } = await supabase.from('csp_reports').insert({
    id: createUlid(),
    document_uri: safeDocUri,
    referrer: report['referrer'] ? redactPii(String(report['referrer'])) : null,
    blocked_uri: safeBlockedUri,
    violated_directive: report['violated-directive'] ?? null,
    effective_directive: report['effective-directive'] ?? null,
    original_policy: report['original-policy'] ?? null,
    disposition: report['disposition'] ?? 'enforce',
    status_code: typeof report['status-code'] === 'number' ? report['status-code'] : null,
    user_agent: req.headers.get('user-agent') ?? null,
    ip: ip ?? null,
  });

  if (error) {
    // Non-fatal: log and continue — CSP reporting must not fail loudly
    console.error('[csp-report] insert failed:', error.message);
  }

  // Always return 204-equivalent — browsers expect no content
  return { ok: true };
});
