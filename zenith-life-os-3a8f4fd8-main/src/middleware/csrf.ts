/**
 * Wave 03 — CSRF Protection Middleware
 * Double-submit cookie pattern for mutation endpoints.
 * SECURITY: All non-GET/HEAD/OPTIONS requests must include matching CSRF token.
 */

const CSRF_COOKIE_NAME = '__zenith_csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function generateCsrfToken(): string {
  const array = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

function getCsrfFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie') ?? '';
  const match = cookieHeader.match(new RegExp(`${CSRF_COOKIE_NAME}=([^;]+)`));
  return match ? match[1] : null;
}

/**
 * Validate CSRF token on mutation requests.
 * Returns null if valid, or an error Response if invalid.
 */
export function validateCsrf(request: Request): Response | null {
  if (SAFE_METHODS.has(request.method)) return null;

  const cookieToken = getCsrfFromCookie(request);
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    return new Response(JSON.stringify({
      ok: false,
      error: { code: 'CSRF_MISSING', message: 'CSRF token required for mutations' },
    }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  }

  // Constant-time comparison to prevent timing attacks
  if (cookieToken.length !== headerToken.length) {
    return new Response(JSON.stringify({
      ok: false,
      error: { code: 'CSRF_INVALID', message: 'CSRF token mismatch' },
    }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  }

  let mismatch = 0;
  for (let i = 0; i < cookieToken.length; i++) {
    mismatch |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i);
  }

  if (mismatch !== 0) {
    return new Response(JSON.stringify({
      ok: false,
      error: { code: 'CSRF_INVALID', message: 'CSRF token mismatch' },
    }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  }

  return null; // Valid
}

/**
 * Set CSRF cookie on response if not already present.
 */
export function ensureCsrfCookie(request: Request, response: Response): Response {
  const existing = getCsrfFromCookie(request);
  if (existing) return response;

  const token = generateCsrfToken();
  const headers = new Headers(response.headers);
  headers.append(
    'Set-Cookie',
    `${CSRF_COOKIE_NAME}=${token}; Path=/; SameSite=Strict; Secure; HttpOnly; Max-Age=86400`
  );
  // Also expose via response header for client to read
  headers.set('X-CSRF-Token', token);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
