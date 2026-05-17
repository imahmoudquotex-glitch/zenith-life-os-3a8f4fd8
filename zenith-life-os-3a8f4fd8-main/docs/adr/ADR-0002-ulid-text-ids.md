# ADR-0002: Business IDs — ULID TEXT

## Status

Accepted

## Context

PostgreSQL `UUID` was used in some migrations (e.g., 0800_formula_definitions).
The architecture plan mandates ULID TEXT for all business entities.

ULIDs provide:
- Lexicographic sorting (time-ordered)
- No information leakage (unlike sequential IDs)
- Compact representation (26 chars vs 36 for UUID)
- Human-readable Crockford Base32 encoding

## Decision

All business tables use `id TEXT PRIMARY KEY CHECK (public.is_ulid(id))`.

- `workspace_id TEXT NOT NULL REFERENCES public.workspaces(id)`
- No `UUID PRIMARY KEY` for business tables
- No `SERIAL` or `BIGSERIAL`
- Supabase `auth.users` keeps its native UUID, mapped via `users.auth_uid UUID`

## Consequences

- `is_ulid()` function must exist before any business table migration
- ULID generation happens in application code (`@zenith/shared/ids`)
- All existing UUID-based migrations must be rewritten
- CI script `check-migrations.ts` fails on UUID business IDs

## Security Impact

- ULIDs are not predictable (random component)
- No sequential enumeration possible
