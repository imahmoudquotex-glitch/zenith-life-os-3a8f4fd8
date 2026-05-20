import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import crypto from 'node:crypto';

// ─── Mutation methods that require CSRF protection ───────────────────────────
const MUTATION_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

// ─── Routes exempt from CSRF (webhook inbound — use HMAC signature instead) ─
const CSRF_EXEMPT = ['/api/v1/webhooks', '/api/csp-report'];

// ─── CSP builder ─────────────────────────────────────────────────────────────
function buildCsp(nonce: string, supabaseHost: string): string {
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data:`,
    `connect-src 'self' https://${supabaseHost} wss://${supabaseHost}`,
    `worker-src 'self' blob:`,
    `manifest-src 'self'`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `require-trusted-types-for 'script'`,
    `trusted-types app default 'allow-duplicates'`,
    `upgrade-insecure-requests`,
    `report-uri /api/csp-report`,
  ].join('; ');
}

// ─── Sec-Fetch-Site check ────────────────────────────────────────────────────
function isSameOriginRequest(req: NextRequest): boolean {
  const fetchSite = req.headers.get('sec-fetch-site');
  // Browser does not send sec-fetch-site for same-origin or direct navigation
  return !fetchSite || fetchSite === 'same-origin' || fetchSite === 'same-site' || fetchSite === 'none';
}

// ─── CSRF double-submit cookie validation ────────────────────────────────────
function validateCsrf(req: NextRequest): boolean {
  const cookieToken = req.cookies.get('__csrf')?.value;
  const headerToken = req.headers.get('x-csrf-token');
  if (!cookieToken || !headerToken) return false;
  if (cookieToken.length !== headerToken.length) return false;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(cookieToken, 'hex'),
      Buffer.from(headerToken, 'hex'),
    );
  } catch {
    return false;
  }
}

// ─── Middleware ───────────────────────────────────────────────────────────────
export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // CSRF enforcement on mutations
  if (MUTATION_METHODS.has(method)) {
    const isExempt = CSRF_EXEMPT.some((p) => pathname.startsWith(p));
    if (!isExempt) {
      if (!isSameOriginRequest(req)) {
        return new NextResponse(
          JSON.stringify({ ok: false, error: { code: 'CSRF_ORIGIN_REJECTED', message: 'Cross-origin mutations are not allowed' } }),
          { status: 403, headers: { 'Content-Type': 'application/json' } },
        );
      }
      if (!validateCsrf(req)) {
        return new NextResponse(
          JSON.stringify({ ok: false, error: { code: 'CSRF_TOKEN_INVALID', message: 'CSRF token missing or invalid' } }),
          { status: 403, headers: { 'Content-Type': 'application/json' } },
        );
      }
    }
  }

  const nonce = crypto.randomBytes(16).toString('base64');
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? '';
  let supabaseHost = 'supabase.co';
  try { supabaseHost = new URL(supabaseUrl).host; } catch { /* noop */ }

  const res = NextResponse.next();

  // Security headers
  res.headers.set('Content-Security-Policy', buildCsp(nonce, supabaseHost));
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=(), payment=(), usb=()');
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  res.headers.set('Cross-Origin-Embedder-Policy', 'credentialless');
  res.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

  // Pass nonce to layout via header (read in layout.tsx)
  res.headers.set('x-csp-nonce', nonce);

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest).*)'],
};
