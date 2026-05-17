# ADR-0001: Stack Decision — TanStack Start on Cloudflare Workers

## Status

Accepted

## Context

The project started with TanStack Start + Cloudflare Workers as the primary framework.
However, dead code using `next/server` (NextRequest/NextResponse) was left in `src/app/api/`.
This caused confusion about the true stack and made the codebase appear broken.

The project requires:
- SSR support for SEO and initial load
- Desktop PWA with offline capability
- Server-side auth with httpOnly cookies
- Edge deployment (Cloudflare Workers)
- RTL + Dark mode first

## Decision

**Keep TanStack Start on Cloudflare Workers** as the primary stack.

- All API routes use TanStack server functions or Hono router under `src/api/`
- No `next/server`, `NextRequest`, `NextResponse` anywhere in codebase
- Deployment target: Cloudflare Workers via `wrangler`
- SSR via TanStack Start server entry (`src/server.ts`)
- Auth cookies handled server-side via TanStack server functions

## Consequences

- Must remove `src/app/api/` directory entirely
- Must ensure `@supabase/ssr` works under Cloudflare Workers
- Must implement CSP nonce in `src/server.ts` middleware
- Must implement CSRF via custom cookie/header pattern (no Next.js middleware)
- Service Worker must be manually registered (no next-pwa)

## Alternatives Considered

- **Next.js App Router**: Would require full migration, loss of Cloudflare edge deployment
- **Hybrid**: Rejected — mixing frameworks creates exactly the bugs found in review

## Security Impact

- Server functions handle auth, no client-side token storage
- CSP headers set in `src/server.ts` response wrapper
- CSRF tokens issued server-side, validated on mutations

## Migration Plan

1. Delete `src/app/` directory
2. Consolidate all API logic under `src/api/` with TanStack server functions
3. Add security headers middleware in `src/server.ts`
4. Implement `@supabase/ssr` cookie adapter for Cloudflare Workers
