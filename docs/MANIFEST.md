# Zenith Life OS — Architecture Manifest
<!-- machine-readable: MANIFEST_VERSION=1 -->

This file is the **canonical source of truth** for all architectural invariants.
Every invariant here MUST have a counterpart `check:*` script in `zenith/scripts/`.
The `check:manifest` script validates this file against the actual scripts.

---

## CRYPTO_INVARIANTS
<!-- INVARIANT_ID: CRYPTO_001 CHECK_SCRIPT: check:crypto -->
- MUST use: Argon2id (password hashing), XChaCha20-Poly1305 (symmetric encryption), X25519 (key exchange), Ed25519 (signatures)
- MUST use: @noble/ciphers or libsodium as crypto source
- MUST NOT use: AES-ECB, MD5, SHA1, 3DES, RC4, crypto.createCipher (deprecated)
- MUST NOT use: PBKDF2 or bcrypt for vault keys

<!-- INVARIANT_ID: CRYPTO_002 CHECK_SCRIPT: check:vault-leak -->
- MUST route all secrets through Vault (never env on client)
- MUST NOT expose vault plaintext to AI, logs, or client bundles

<!-- INVARIANT_ID: CRYPTO_003 CHECK_SCRIPT: check:vapid-key-not-in-client -->
- MUST NOT include VAPID_PRIVATE_KEY in any client bundle
- MUST NOT include any API key (OpenAI, Anthropic, Resend) in client bundle

---

## TENANT_INVARIANTS
<!-- INVARIANT_ID: TENANT_001 CHECK_SCRIPT: check:tenants -->
- MUST have workspace_id (or tenant_id) as NOT NULL FK on every user-data table
- MUST NOT query cross-workspace data without explicit workspace_id filter

<!-- INVARIANT_ID: TENANT_002 CHECK_SCRIPT: check:rls -->
- MUST have RLS policies on every tenant table filtering by workspace_id
- MUST NOT disable RLS on any tenant table

<!-- INVARIANT_ID: TENANT_003 CHECK_SCRIPT: check:no-sql-in-routes -->
- MUST NOT write raw SQL in apps/web/src/app/api/
- MUST route all DB access through packages/repo/ layer

---

## MONEY_INVARIANTS
<!-- INVARIANT_ID: MONEY_001 CHECK_SCRIPT: check:money -->
- MUST store all monetary values as BIGINT in minor units (cents/qirsh)
- MUST suffix money columns with _cents or _minor
- MUST NOT use FLOAT, NUMERIC, REAL, DOUBLE PRECISION for money columns
- MUST NOT call parseFloat() on monetary strings

---

## AUDIT_INVARIANTS
<!-- INVARIANT_ID: AUDIT_001 CHECK_SCRIPT: check:audit-events -->
- MUST write to audit_events on every state-changing mutation
- MUST include: actor_id, workspace_id, entity_type, entity_id, action, metadata

<!-- INVARIANT_ID: AUDIT_002 CHECK_SCRIPT: check:audit-merkle -->
- MUST maintain tamper-evident Merkle hash chain on audit_events
- MUST verify chain deterministically (same events = same root)

<!-- INVARIANT_ID: AUDIT_003 CHECK_SCRIPT: check:idempotency -->
- MUST support Idempotency-Key header on all mutation routes
- MUST store idempotency_key in idempotency_keys table
- MUST return cached response on duplicate key

---

## NAMING_INVARIANTS
<!-- INVARIANT_ID: NAMING_001 CHECK_SCRIPT: check:naming -->
- MUST name migration files: NNNN_snake_case_description.sql (single underscore)
- MUST use ULID for all primary keys (not UUID, not serial)
- MUST suffix timestamp columns with _at (created_at, updated_at)

<!-- INVARIANT_ID: NAMING_002 CHECK_SCRIPT: check:migrations -->
- MUST keep migrations in wave-correct number ranges:
  - W00: 0001–0099, W01: 0100–0199, W02: 0200–0299
  - W03: 0300–0399, W04: 0400–0499, W05: 0500–0599
  - W06: 0600–0699, W07: 0700–0799, W08: 0800–0899

---

## FRONTEND_INVARIANTS
<!-- INVARIANT_ID: FRONTEND_001 CHECK_SCRIPT: check:dark-only-tokens -->
- MUST use dark-only design tokens (no light mode variants)
- MUST NOT define light mode CSS custom properties

<!-- INVARIANT_ID: FRONTEND_002 CHECK_SCRIPT: check:no-ai-in-render -->
- MUST NOT call AI APIs from inside React component render or useEffect
- MUST route AI calls through server-only routes or background jobs

<!-- INVARIANT_ID: FRONTEND_003 CHECK_SCRIPT: check:timezone-hardcode -->
- MUST NOT hardcode timezone strings (e.g. 'UTC+3', '+03:00')
- MUST use IANA timezone names from user preferences (default: 'Africa/Cairo')

---

## ROUTE_INVARIANTS
<!-- INVARIANT_ID: ROUTE_001 CHECK_SCRIPT: check:routes-envelope -->
- MUST wrap all API route handlers with withEnvelope()
- MUST return shape: { ok: boolean, data?: T, error?: { code, message }, meta: { requestId, ts } }

---

## WORKER_INVARIANTS
<!-- INVARIANT_ID: WORKER_001 CHECK_SCRIPT: check:worker-leases -->
- MUST use advisory locks or DB-level leases for all background job processing
- MUST NOT run duplicate jobs via missing lease coordination

---

## PWA_INVARIANTS
<!-- INVARIANT_ID: PWA_001 CHECK_SCRIPT: check:sw-audit -->
- MUST deny-list /api/, /auth/, /vault/, /account/ from service worker cache
- MUST pre-cache app shell for offline use

---

## MANIFEST_END
