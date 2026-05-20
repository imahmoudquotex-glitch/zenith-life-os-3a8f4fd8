# ADR-0001 — Framework Choice: Next.js 15 App Router

**Date:** 2026-05-13
**Status:** Accepted
**Deciders:** Owner

## Context
Zenith Life OS requires SSR, Server Actions, RSC, and App Router routing.
The initial Lovable.dev template used Vite + TanStack Start — not aligned with the plan.

## Decision
Use **Next.js 15** with App Router + Server Actions + RSC.

## Consequences
- Server Actions replace REST mutations where applicable
- RSC streaming for progressive UI
- Deployment: Vercel or Node.js runtime
- Cloudflare Workers NOT used

## Rejected Alternatives
- TanStack Start: immature RSC ecosystem
- Remix: less mature RSC streaming
- Vite SPA: no SSR or Server Actions
