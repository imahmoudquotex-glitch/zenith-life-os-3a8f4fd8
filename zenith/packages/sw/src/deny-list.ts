// packages/sw/src/deny-list.ts
// Wave: W03 — Service Worker NetworkOnly deny-list for sensitive paths

/**
 * Paths that must NEVER be cached by the Service Worker.
 * Any request matching these patterns goes NetworkOnly.
 * Adding new sensitive paths: update this file + ci.yml check.
 */
export const REQUIRED_DENY_PATHS = [
  '/api/',
  '/auth/',
  '/vault/',
  '/api/ai/',
  '/api/billing/',
  '/api/webhooks/',
  '/api/csrf',
  '/api/csp-report',
  '/api/push/',
];

export const NEVER_CACHE_PATTERNS: ReadonlyArray<RegExp> = [
  /^\/api\//,
  /^\/auth\//,
  /^\/vault\//,
  /^\/account\//,
  /^\/settings\/security/,
  /^\/api\/v1\//,
  /^\/api\/ai\//,
  /^\/api\/billing\//,
  /^\/api\/webhooks\//,
  /^\/api\/csrf$/,
  /^\/api\/csp-report$/,
  /^\/api\/push\//,
  /^\/api\/export\//,
  /^\/api\/import\//,
  /^\/api\/account\//,
  /^\/api\/api-keys\//,
  /^\/share\/.*\/protected/,
];

/**
 * Return true if this path must never be cached.
 */
export function shouldNeverCache(pathname: string): boolean {
  return NEVER_CACHE_PATTERNS.some((rx) => rx.test(pathname));
}
