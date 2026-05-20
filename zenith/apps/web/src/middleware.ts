import { NextRequest, NextResponse } from 'next/server';

/**
 * Zenith Security Middleware — Wave 03
 *
 * Applies on every navigation + page request:
 * - Content-Security-Policy (strict, no unsafe-inline, nonce-based)
 * - HSTS (2 years + preload)
 * - X-Frame-Options + frame-ancestors (double enforcement)
 * - Referrer-Policy
 * - Permissions-Policy
 * - COOP / COEP / CORP
 * - x-csp-nonce (for server components to read via headers())
 */
export function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());

  // ─── Content-Security-Policy ─────────────────────────────────────────────
  // style-src uses nonce, NOT unsafe-inline (W03 contract)
  const cspHeader = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${
      process.env.NODE_ENV === 'production' ? '' : " 'unsafe-eval'"
    }`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' blob: data: https://*.supabase.co`,
    `font-src 'self'`,
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co`,
    `media-src 'self'`,
    `worker-src 'self'`,
    `manifest-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `block-all-mixed-content`,
    `upgrade-insecure-requests`,
    `require-trusted-types-for 'script'`,
    `trusted-types nextjs default`,
    process.env.NEXT_PUBLIC_CSP_REPORT_URI
      ? `report-uri ${process.env.NEXT_PUBLIC_CSP_REPORT_URI}`
      : `report-uri /api/csp-report`,
  ].join('; ');

  // ─── Forward nonce + CSP to route handlers ────────────────────────────────
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('x-csp-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // ─── CSP ─────────────────────────────────────────────────────────────────
  response.headers.set('Content-Security-Policy', cspHeader);

  // ─── HSTS (2 years) ───────────────────────────────────────────────────────
  // Only in production — dev doesn't have HTTPS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload',
    );
  }

  // ─── Click-jacking protection ─────────────────────────────────────────────
  response.headers.set('X-Frame-Options', 'DENY');

  // ─── MIME sniffing ────────────────────────────────────────────────────────
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // ─── Referrer leakage ────────────────────────────────────────────────────
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // ─── Permissions-Policy ──────────────────────────────────────────────────
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(self), geolocation=(), payment=(), usb=(), bluetooth=()',
  );

  // ─── Cross-Origin isolation ───────────────────────────────────────────────
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Embedder-Policy', 'credentialless');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

  // ─── XSS protection (legacy browsers) ────────────────────────────────────
  response.headers.set('X-XSS-Protection', '0'); // Disabled — CSP is authoritative

  // ─── x-csp-nonce for server components ───────────────────────────────────
  response.headers.set('x-csp-nonce', nonce);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - sw.js (Service Worker — must not have CSP header)
     * - offline.html
     * Note: /api/ IS matched — middleware adds security headers to all routes
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|sw\\.js|offline\\.html).*)',
  ],
};
