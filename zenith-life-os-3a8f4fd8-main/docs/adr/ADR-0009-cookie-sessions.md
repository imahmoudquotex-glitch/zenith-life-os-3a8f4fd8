# ADR-0009: Cookie-Based Session Management

**Status:** Accepted  
**Date:** 2026-05-17  
**Decision-Makers:** Architecture Team

## Context

Storing auth tokens in `localStorage` or `sessionStorage` exposes them to XSS attacks. The Zenith security model requires that auth credentials never touch JavaScript-accessible storage.

## Decision

1. **httpOnly cookies**: Access and refresh tokens stored exclusively in `httpOnly; Secure; SameSite=Lax` cookies.
2. **No localStorage secrets**: CI gate `check-no-localstorage-secrets.ts` blocks any `localStorage.setItem` with sensitive keys.
3. **Session lifecycle**: `setSessionCookies()`, `getSessionFromCookies()`, `clearSessionCookies()`, `validateSession()`.
4. **Refresh flow**: When access token expires, the server-side middleware uses the refresh cookie to obtain a new access token.
5. **Sign-out**: Both cookies are expired (Max-Age=0).

## Invariants

- `I-007`: No auth tokens in localStorage/sessionStorage.
- CI gate `check-no-localstorage-secrets.ts` enforces this.

## Consequences

- CSRF protection is mandatory (tokens auto-sent with cookies)
- Slightly more complex client auth wrapper
- Complete XSS immunity for auth tokens
