/**
 * Service Worker NetworkOnly deny list.
 * These paths are NEVER cached — always fetch from network.
 *
 * Coverage (verified by check:sw-audit):
 * /api/ /auth/ /vault/ /account/
 * /api/ai/ /api/billing/ /api/webhooks/
 * /api/csrf /api/csp-report /api/push/
 */
const DENY_PATTERNS: RegExp[] = [
  /^\/api\/auth(\/.*)?$/,
  /^\/api\/vault(\/.*)?$/,
  /^\/api\/ai(\/.*)?$/,
  /^\/api\/billing(\/.*)?$/,
  /^\/api\/webhooks(\/.*)?$/,
  /^\/api\/export(\/.*)?$/,
  /^\/api\/import(\/.*)?$/,
  /^\/api\/account(\/.*)?$/,
  /^\/api\/api-keys(\/.*)?$/,
  /^\/api\/csrf$/,
  /^\/api\/csp-report$/,
  /^\/api\/push\/(subscribe|unsubscribe)$/,
  /^\/auth(\/.*)?$/,
  /^\/vault(\/.*)?$/,
  /^\/account(\/.*)?$/,
  /^\/settings\/security/,
];

export function shouldNeverCache(pathname: string): boolean {
  return DENY_PATTERNS.some((rx) => rx.test(pathname));
}

export const DENY_LIST = DENY_PATTERNS;
