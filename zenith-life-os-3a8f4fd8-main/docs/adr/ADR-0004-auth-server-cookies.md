# ADR-0004: Auth — Server-Side Cookies

## Status

Accepted

## Context

The previous implementation used `persistSession: true` with Supabase client,
storing access_token and refresh_token in localStorage. This is vulnerable to
XSS attacks — any script injection can steal the refresh token and gain full
account access.

## Decision

- Auth sessions stored in **httpOnly, Secure, SameSite=Lax** cookies only
- `persistSession: false` on all browser Supabase clients
- Server functions handle token refresh and session management
- CSRF token issued server-side, validated on all mutations
- Session rotation after every signin and refresh
- Account lockout after 5 failed attempts in 15 minutes
- All auth events logged to `auth_events` table

## Consequences

- `localStorage` and `sessionStorage` never contain auth tokens
- Offline PWA cannot refresh sessions (acceptable — user re-authenticates)
- CSRF middleware required on all POST/PATCH/DELETE routes
- `@supabase/ssr` cookie adapter needed for Cloudflare Workers

## Security Impact

- XSS can no longer steal auth tokens
- CSRF protection prevents cross-site request forgery
- Session rotation limits session fixation attacks
- Account lockout limits brute force attacks
- Audit trail for all auth actions
