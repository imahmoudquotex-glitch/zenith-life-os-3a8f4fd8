# ADR-0002 — Monorepo Structure

**Date:** 2026-05-13
**Status:** Accepted
**Deciders:** Owner

## Context

Zenith Life OS needs to share code between `apps/web` (Next.js 15) and `apps/worker` (background job processor). A monorepo structure avoids duplication and enables single-version dependency management.

## Decision

Use **pnpm workspaces** monorepo:

```
zenith/
├── apps/
│   ├── web/          # Next.js 15 App Router application
│   └── worker/       # Background job processor (Node.js)
├── packages/
│   ├── shared/       # Types, utils, Result<T>, error codes
│   ├── vault-crypto/ # ZKE: XChaCha20-Poly1305 + Argon2id
│   ├── ai/           # AI gateway (runAIWithQuota)
│   ├── security/     # CSP, CSRF, HMAC, PII redaction
│   ├── auth/         # Auth guards + JWT verification
│   ├── db/           # Drizzle schema + migrations
│   ├── offline/      # IndexedDB outbox + Service Worker
│   ├── block-engine/ # Block tree operations
│   ├── db-engine/    # Database query engine (21 property types)
│   └── ...           # 37 packages total
└── scripts/          # CI enforcement scripts (19 checks)
```

## Rules

- Each package has `"name": "@zenith/<name>"` in package.json
- Root `pnpm-workspace.yaml` declares `packages: ["packages/*", "apps/*"]`
- No cross-package imports except via declared workspace dependencies
- Each package must pass `pnpm typecheck` independently
- Test files (`*.test.ts`) excluded from `tsc` — run via Vitest
- Turbo (or pnpm `--filter`) for incremental builds

## Rejected Alternatives

- **npm workspaces:** Slower install, no hoisting control
- **Yarn Berry:** Complex PnP setup, poor Windows support
- **Single-package:** Can't share code between web and worker cleanly
