# ADR-0010: Rate Limiting Strategy

**Status:** Accepted  
**Date:** 2026-05-17  
**Decision-Makers:** Architecture Team

## Context

API endpoints must be protected against abuse, brute-force attacks, and resource exhaustion.

## Decision

1. **Sliding window algorithm**: In-memory Map with automatic stale entry cleanup.
2. **Auth endpoints**: 10 requests per 5 minutes per IP (strict).
3. **API endpoints**: 100 requests per minute per IP (standard).
4. **Key format**: `{prefix}:{ip}:{path}` for granular control.
5. **IP extraction**: CF-Connecting-IP → X-Forwarded-For → fallback.
6. **Response headers**: `Retry-After`, `X-RateLimit-Limit/Remaining/Reset`.

## Production Path

Replace in-memory Map with Cloudflare KV or D1 for distributed rate limiting across edge nodes.

## Consequences

- Effective against brute-force and scraping
- Per-node limiting in development (acceptable)
- Production requires distributed state (Cloudflare KV)
