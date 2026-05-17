# ADR-0001: Stack Decision — TanStack Start on Cloudflare Workers

## Status

Accepted

## Context

The original plan referenced Next.js App Router. During initial implementation, TanStack Start was chosen instead due to:

1. **Cloudflare Workers deployment**: TanStack Start runs natively on CF Workers with `@cloudflare/vite-plugin`. Next.js on CF Workers requires `@opennextjs/cloudflare` which is experimental.
2. **Vite ecosystem**: TanStack Start uses Vite, enabling fast HMR, smaller bundles, and plugin compatibility.
3. **React 19 Server Functions**: TanStack Start supports React 19 server functions without the Next.js App Router lock-in.
4. **PWA compatibility**: Service Worker registration and manifest work cleanly with Vite's build pipeline.

## Decision

Use **TanStack Start** with **Vite** on **Cloudflare Workers** as the web framework.

All API routes use TanStack server functions or standard Web Fetch handlers registered in `src/server.ts`, NOT Next.js App Router `route.ts` handlers.

## Consequences

### Positive

- Full control over the request/response pipeline via CF Workers fetch handler.
- Vite plugin ecosystem (Tailwind, path aliases, etc.) works natively.
- No vendor lock-in to Vercel deployment.
- Smaller bundle sizes than Next.js.

### Negative

- No automatic `middleware.ts` convention (must implement manually in `src/server.ts`).
- Smaller community than Next.js — fewer examples for auth/middleware patterns.
- Must implement CSP nonce injection, CSRF, and security headers manually.

### Migration Impact

- All `src/app/api/**/route.ts` files using `NextRequest`/`NextResponse` are **dead code** and must be deleted.
- All `next/server` imports are banned via ESLint rule.
- Server-side auth uses `@supabase/ssr` with cookie adapter, not Next.js `cookies()`.

## Alternatives Considered

1. **Next.js App Router on Vercel**: More mature, but locks deployment to Vercel and adds complexity for CF Workers.
2. **Hono on CF Workers**: Lightweight, but lacks built-in SSR/React integration.
3. **Remix**: Good CF support but TanStack Router was already in use.

## Security Impact

- Security headers must be added manually in `src/server.ts` (CSP, HSTS, COOP, CORP, X-Content-Type-Options).
- CSRF protection must be implemented as middleware in the fetch handler.
- Auth session management via httpOnly cookies requires explicit implementation.
