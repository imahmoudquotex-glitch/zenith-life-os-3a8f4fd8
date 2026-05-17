# ADR-0007: CSRF Protection Strategy

**Status:** Accepted  
**Date:** 2026-05-17  
**Decision-Makers:** Architecture Team

## Context

All mutation endpoints must be protected against Cross-Site Request Forgery. The application uses cookie-based sessions (ADR-0009), making CSRF prevention essential.

## Decision

Implement **Double-Submit Cookie** pattern:

1. **Token generation**: Server generates a cryptographically random 32-byte CSRF token.
2. **Cookie storage**: Token set as `__zenith_csrf` cookie with `SameSite=Strict; Secure; HttpOnly`.
3. **Header verification**: Mutations require `X-CSRF-Token` header matching the cookie value.
4. **Constant-time comparison**: Token comparison uses XOR-based constant-time algorithm to prevent timing attacks.
5. **Safe methods exempt**: GET, HEAD, OPTIONS bypass CSRF checks.

## Invariants

- All non-safe HTTP methods must pass CSRF validation.
- CSRF tokens rotate every 24 hours.

## Consequences

- Client must read the `X-CSRF-Token` response header and include it in mutation requests
- Slightly more complex client-side fetch wrapper
- Robust protection against CSRF without server-side session storage
