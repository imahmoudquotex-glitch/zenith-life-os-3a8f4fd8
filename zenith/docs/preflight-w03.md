# Pre-flight W03 — Security Fortress & Offline PWA

> **Wave:** 03 | **Frozen:** 2026-05-16T17:23:00Z | **Audit completed:** 2026-05-20

---

## 🛑 Optional Features Handshake (Approved 2026-05-20)
As per user confirmation:
- **Web Push (VAPID)**: Set as stubbed/scaffolding ready (keys not provided).
- **CSP Report Endpoint**: Saved to DB `csp_reports` table via Edge function.
- **Bot Protection (reCAPTCHA/Turnstile)**: Relying solely on `rate-limit.ts`.
- **Sentry/Snyk**: Disabled/stubbed (no tokens provided).

---

## ✅ Pre-flight Checklist

### Security Package (`packages/security`)

| Item | Status | Notes |
|------|--------|-------|
| `csp.ts` — nonce-based, no unsafe-inline | ✅ | `buildCsp(nonce, supabaseHost)` |
| `csrf.ts` — double-submit + origin check | ✅ | `generateCsrfToken` + `validateCsrfTokens` |
| `hmac.ts` — timingSafeEqual + length guard | ✅ | `systemClock` injectable |
| `redirect.ts` — safeRedirectPath | ✅ | allowlist only |
| `scanner.ts` — secret pattern scanner | ✅ | SUPABASE_SERVICE_ROLE included |
| `pii-redactor.ts` | ✅ | email + phone + IPv4 |
| `secret-redactor.ts` | ✅ | password/token/key/auth |
| `rate-limit.ts` — sliding window | ✅ | in-memory + Redis path |
| `nonce.ts` — assertNonceFresh | ✅ | webhook_nonces + ±5min |
| `webhook-verifier.ts` — timestamp + anti-replay | ✅ | Stripe-style header parsing |
| `audit.ts` — writeAuditEvent → audit_events | ✅ | PII/secret redacted, Supabase |
| `index.ts` — exports all modules | ✅ | Fixed W03 |

### Middleware (`apps/web/src/middleware.ts`)

| Header | Status |
|--------|--------|
| `Content-Security-Policy` (nonce, no unsafe-inline) | ✅ |
| `Strict-Transport-Security` (2y + preload) | ✅ (prod only) |
| `X-Frame-Options: DENY` | ✅ |
| `X-Content-Type-Options: nosniff` | ✅ |
| `Referrer-Policy: strict-origin-when-cross-origin` | ✅ |
| `Permissions-Policy` | ✅ |
| `Cross-Origin-Opener-Policy: same-origin` | ✅ |
| `Cross-Origin-Embedder-Policy: credentialless` | ✅ |
| `Cross-Origin-Resource-Policy: same-origin` | ✅ |
| `x-csp-nonce` forwarded to server components | ✅ |
| `style-src 'nonce-${nonce}'` (not unsafe-inline) | ✅ |

### DB Migrations (0300–0313)

| Migration | Status |
|-----------|--------|
| 0300 — security_extensions (pgcrypto) | ✅ |
| 0301 — audit_chain (Merkle trigger) | ✅ |
| 0302 — csp_reports | ✅ |
| 0303 — csrf_tokens | ✅ |
| 0304 — sessions_extend (device_fingerprint) | ✅ |
| 0305 — vault_envelope_extend (AES-GCM fields) | ✅ |
| 0306 — vault_master_key_meta (KDF params) | ✅ |
| 0307 — push_subscriptions | ✅ |
| 0308 — device_registry | ✅ |
| 0309 — security_events | ✅ |
| 0310 — rate_limit_lockouts | ✅ |
| 0311 — outbox_server_log | ✅ |
| 0312 — conflict_resolutions | ✅ |
| 0313 — rls_pack_w03 (contract verifier) | ✅ |

### Packages

| Package | Status |
|---------|--------|
| `packages/vault-crypto` (AES-GCM + Argon2id) | ✅ |
| `packages/offline` (IndexedDB outbox + sync) | ✅ |
| `packages/sw` (deny-list + caching rules) | ✅ |
| `packages/pwa` (SW register + install prompt) | ✅ |
| `packages/push` (VAPID subscription) | ✅ |

### PWA

| Item | Status |
|------|--------|
| `apps/web/public/sw.js` | ✅ |
| `apps/web/public/offline.html` | ✅ |
| `manifest.ts` — standalone + RTL + shortcuts | ✅ |
| SW deny-list covers all sensitive paths | ✅ |
| No `skipWaiting()` without user approval | ✅ |
| `Idempotency-Key` in sync requests | ✅ |

### CSP Report Route

| Item | Status |
|------|--------|
| Saves to `csp_reports` table | ✅ |
| Uses service-role client | ✅ |
| PII redacted before insert | ✅ |

### CI/CD

| Check | Status |
|-------|--------|
| `check:sw-audit` in ci.yml | ✅ |
| `check:vapid-key-not-in-client` in ci.yml | ✅ |
| `check:audit-merkle` in ci.yml | ✅ |
| `lighthouse.yml` PWA workflow | ✅ |
| Gitleaks | ✅ |

### Security Files

| Item | Status |
|------|--------|
| `jwt_secret_tmp.txt` deleted | ✅ |
| `keys.json` deleted | ✅ |

---

## Contracts Verified (W03 Invariants)

1. ✅ No `unsafe-inline` in `style-src` — uses nonce
2. ✅ No `AES-ECB`, `MD5`, `SHA1`, `3DES`, `RC4` in codebase
3. ✅ `VAPID_PRIVATE_KEY` never in client bundle
4. ✅ Vault master key never stored — memory only, `secureClear()` on logout
5. ✅ Audit events write-only (no UPDATE/DELETE) — DB trigger enforced
6. ✅ Merkle chain trigger `trg_audit_chain` on `audit_events`
7. ✅ Service Worker precaches only shell — all `/api/` routes NetworkOnly
8. ✅ Idempotency-Key required for all sync mutations
9. ✅ Webhook anti-replay via `assertNonceFresh` + `webhook_nonces` table
10. ✅ All W03 tables have RLS + FORCE RLS (verified by migration 0313)

---

## DoD (Definition of Done) — W03

- [x] All migrations 0300–0313 created with correct RLS
- [x] `packages/vault-crypto` complete (Argon2id + AES-GCM envelope)
- [x] `packages/offline` complete (outbox + sync + backoff + conflict)
- [x] `packages/sw` complete (deny-list + runtime-caching)
- [x] `packages/pwa` + `packages/push` created
- [x] `sw.js` production-ready in `public/`
- [x] `offline.html` fallback page in Arabic
- [x] Middleware: all security headers added
- [x] `audit.ts` fixed: Supabase + `audit_events` + redaction
- [x] `security/index.ts` exports all modules
- [x] `webhook-verifier.ts` full validation (timestamp + anti-replay)
- [x] `assertNonceFresh` implemented
- [x] CSP report route saves to DB
- [x] CI: W03 checks added (sw-audit, vapid, audit-merkle)
- [x] Lighthouse PWA workflow created
- [x] Sensitive files deleted from repo
- [x] `docs/preflight-w03.md` created

---

*Generated automatically by audit + fix pass on 2026-05-20.*
