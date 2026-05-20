# 🛡️ Zenith Life OS — Architecture Invariants

> **Status:** ✅ CONTRACT — Violation = Build Failure
> These 12 rules are non-negotiable. CI enforces them automatically.

---

## INV-01: Desktop-only PWA
- App shell offline precached (shell.html/css/js/fonts/icons)
- Min window: 1024×640 / Optimal: 1440×900
- Installable manifest: `display=standalone`, `theme_color=#0a0a0a`
- Keyboard-first: Command Palette ⌘K, Quick Switcher ⌘P, Smart Search ⌘/
- File System Access API for import
- Web Push via VAPID + endpoint subscriptions

## INV-02: Dark Mode Invariant
- Tokens: `--bg-canvas:#0a0a0a`, `--bg-surface:#131313`, `--bg-elevated:#1c1c1c`
- Text: `--text-primary:#fafafa`, `--text-secondary:#a3a3a3`
- Accents: `--accent-neon:#4ade80`, `--accent-danger:#ef4444`
- CI visual snapshot rejects any light surface
- WCAG 2.2 AA: contrast ≥ 4.5:1
- `prefers-reduced-motion` respected (animations max 200ms)

## INV-03: Multi-Tenant Fortress
- Every tenant table: `workspace_id TEXT NOT NULL` + FK + RLS + FORCE RLS
- Policy naming: `<table>_isolation`
- `current_workspace_id()` and `current_user_id()` set per request
- ESLint: no cross-workspace JOIN without audit
- Tenant context middleware fails request if context not set

## INV-04: Zero-Knowledge Encryption (ZKE)
- KDF: Argon2id (t=3, m=64MiB, p=4, salt=16B random per user)
- Symmetric: XChaCha20-Poly1305 AEAD, nonce 24B, AAD = `{workspace_id, item_id, version}`
- Asymmetric: X25519 ECDH + sealed boxes (libsodium)
- Master Key (MK) = Argon2id(passphrase, salt) → in-memory WASM → wiped on tab close
- Item Encryption Key (IEK) random per item, encrypted by MK as `wrapped_iek BYTEA`
- **BANNED in plaintext:** AI prompts, analytics, audit, IndexedDB, localStorage, SSR cache, Sentry, logs
- Recovery: Shamir's Secret Sharing 3-of-5 opt-in
- HW unlock: WebAuthn `largeBlob` extension

## INV-05: AI Safety Perimeter
- Sole entrypoint: `runAIWithQuota({sensitivity, workspaceId, userId, prompt, schema})`
- Sensitivity: `none|low|medium|high`
- `high` = AI blocked entirely (vault, journals, moods, financial PII, biometric)
- Context scrubbing: regex + PII model before prompt
- Output: Zod structured validation
- System prompt: `<user_input>...</user_input>` containment
- Quota: atomic reserve/complete/refund RPCs
- ESLint: blocks `openai`/`@anthropic-ai/sdk` outside `packages/ai/src/providers/`
- Whisper Mode: global toggle disables all AI

## INV-06: Observability
- OpenTelemetry auto-instrument: http, pg, redis, fetch
- Root span: `<method> <route>` with `app.workspace_id`, `app.user_id`, `app.request_id`
- Logging: pino JSON
- SLOs: API p99<300ms, DB p99<50ms, AI p95<5s, error rate<0.1%
- Alerts: PagerDuty/Slack on SLO breach + DLQ depth + error budget exhaustion

## INV-07: Disaster Recovery
- RTO ≤ 1h, RPO ≤ 15min
- PITR: 7d hot / 30d warm / 1y cold (encrypted S3 Glacier)
- Quarterly restore drills documented
- Multi-region active-passive: eu-west-1 primary, us-east-1 standby

## INV-08: Accessibility (WCAG 2.2 AA)
- Semantic HTML
- Full keyboard navigation
- Focus visible
- ARIA labels
- Screen reader tested: NVDA + VoiceOver
- `prefers-reduced-motion` + `prefers-contrast` respected

## INV-09: Donations-Only Economics
- All features free for everyone
- Donations optional — no feature gate
- Badge: celebratory only, no permissions
- Table: `donations(id, user_id, amount_cents BIGINT, currency CHAR(3), provider, provider_tx_id, status, anonymous BOOLEAN, created_at)`

## INV-10: Supply Chain Hardening
- SBOM (CycloneDX) in every release
- OSSF Scorecard ≥ 7.0
- Sigstore signing for artifacts
- Dependabot + Renovate
- gitleaks + Semgrep + OWASP ZAP in CI

## INV-11: Testing Matrix
- Vitest unit ≥ 85% (services, repos)
- pgTAP 100% RLS tables
- Playwright E2E critical paths
- Chromatic visual regression
- k6 load testing
- Semgrep + ZAP + gitleaks: 0 high/critical

## INV-12: Data Model Standards
- Primary keys: TEXT ULID (`^[0-9A-HJKMNP-TV-Z]{26}$`)
- Monetary values: `*_cents BIGINT`
- Database naming: snake_case
- Migration header: `-- File: NNNN__<slug>.sql / Wave / Description / Author / Created / Idempotent:YES`
- All migrations: BEGIN/COMMIT + IF NOT EXISTS + concurrent index creation
- Forbidden primitives: AES-ECB, MD5, SHA1, 3DES, RC4, weak DH groups
