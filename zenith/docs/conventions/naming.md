# 📐 Zenith Naming Conventions

> **Status:** ✅ CONTRACT — Phase 01 Frozen
> Any violation fails CI via `scripts/check-naming.ts`

---

## Database

### Tables
- **Format:** `snake_case`, plural (e.g., `workspaces`, `vault_items`, `audit_events`)
- **System tables exception:** `_migrations`, `_seeds`

### Columns
| Pattern | Example | Rule |
|---------|---------|------|
| Primary key | `id TEXT` | ULID CHECK, never UUID/SERIAL |
| Foreign key | `workspace_id TEXT` | Always suffixed `_id` |
| Money | `amount_cents BIGINT` | Always `*_cents`, never DECIMAL |
| Boolean | `is_deleted`, `has_mfa` | Prefixed `is_*` or `has_*` |
| Count | `streak_count INT` | Suffixed `*_count` |
| JSON | `metadata_json JSONB` | Suffixed `*_json` |
| Timestamps | `created_at TIMESTAMPTZ` | Always UTC, `created_at` + `updated_at` |
| Soft delete | `is_deleted BOOLEAN`, `deleted_at TIMESTAMPTZ` | Both required |
| Encryption | `wrapped_iek BYTEA`, `nonce BYTEA`, `aead_tag BYTEA` | Also `kdf_params JSONB`, `encryption_algo TEXT`, `key_version INT` |
| Donations | `amount_cents BIGINT`, `currency CHAR(3)` | Also `provider TEXT`, `provider_tx_id TEXT`, `anonymous BOOLEAN` |
| Compliance | `consent_kind TEXT`, `data_region CHAR(8)` | Also `data_residency_locked BOOLEAN` |

### Indexes
- `idx_<table>_<column(s)>` — e.g., `idx_workspaces_slug`
- Partial: `idx_<table>_<column>_active` for `WHERE NOT is_deleted`

### Constraints
| Type | Format | Example |
|------|--------|---------|
| Primary key | `pk_<table>` | `pk_workspaces` |
| Foreign key | `fk_<table>_<column>` | `fk_users_workspaces_workspace_id` |
| Unique | `uq_<table>_<column>` | `uq_users_email` |
| Check | `chk_<table>_<column>` | `chk_workspaces_id_ulid` |

### Enums
- Type name: `<table>_<column>` lowercase — e.g., `workspace_plan`
- Values: `UPPER_SNAKE` — e.g., `'FREE'`, `'PREMIUM'`

### Functions & Triggers
- Functions: `<verb>_<noun>()` — e.g., `set_updated_at()`, `is_ulid()`
- Triggers: `trg_<table>_<event>_<purpose>` — e.g., `trg_workspaces_update_set_updated_at`

### Migrations
- **Format:** `NNNN__<slug>.sql` — e.g., `0001__extensions.sql`
- **Header:** Required fields: File, Wave, Description, Author, Created, Idempotent
- **Body:** BEGIN/COMMIT + IF NOT EXISTS + concurrent index creation

---

## TypeScript

### Files
- **Format:** `kebab-case` — e.g., `design-tokens.ts`, `check-naming.ts`
- **Tests:** `<name>.test.ts` colocated with source

### Identifiers
| Type | Format | Example |
|------|--------|---------|
| Types/Interfaces | PascalCase | `ApiEnvelope`, `CursorPage` |
| Variables/Functions | camelCase | `createUlid`, `respondOk` |
| Constants | UPPER_SNAKE | `DEFAULT_PAGE_SIZE`, `ULID_REGEX` |
| Enums | PascalCase name, UPPER_SNAKE values | `enum Status { ACTIVE, DELETED }` |

### Imports
- `type` imports: use `import type { X }` for type-only imports
- No default exports (ESLint enforced)

---

## API

### Routes
- **Format:** `/api/v1/<resource>` plural — e.g., `/api/v1/tasks`, `/api/v1/workspaces`
- **Query params:** camelCase — e.g., `?pageSize=25&cursor=abc`
- **Path params:** kebab-case IDs — e.g., `/api/v1/tasks/:taskId`

### Events
- **Format:** `<domain>.<action>.<tense>` — e.g., `task.create.completed`, `auth.login.failed`

### Metrics
- **Format:** `zenith_<domain>_<metric>_<unit>` — e.g., `zenith_http_request_duration_seconds`

### Error Codes
- **Format:** `<DOMAIN>_<NNN>` — e.g., `AUTH_001`, `RLS_002`, `AI_003`

---

## Environment Variables
- **Format:** `UPPER_SNAKE_CASE`
- **Public (client):** prefixed `NEXT_PUBLIC_`
- **Access:** Only through `packages/shared/src/env.ts` — `process.env.X` is BANNED elsewhere
