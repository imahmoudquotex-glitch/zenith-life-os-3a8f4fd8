# ADR-0004: ULID-Based Identifiers

**Status:** Accepted  
**Date:** 2026-05-17  
**Decision-Makers:** Architecture Team

## Context

The system requires unique identifiers that are sortable, URL-safe, and non-sequential (for security). UUIDs are not sortable by creation time, and auto-incrementing integers leak data about system usage.

## Decision

All business entity IDs use **ULID** (Universally Unique Lexicographically Sortable Identifier):

1. **Type**: `TEXT` column with `CHECK (public.is_ulid(id))` constraint.
2. **Generation**: Client-side or server-side via `ulid()` function.
3. **Format**: 26-character Crockford Base32 string (e.g., `01ARZ3NDEKTSV4RRFFQ69G5FAV`).
4. **Migration**: `0100_enforce_ulid_retroactive.sql` validates all existing IDs.

## Invariants

- `I-004`: No UUID-typed columns. All IDs are `TEXT` with ULID validation.
- CI gate `check-no-uuid-columns.ts` scans all migrations.

## Consequences

- Slightly larger than UUIDs (26 vs 36 chars, but no dashes)
- Time-sortable for efficient B-tree indexing
- Cannot use PostgreSQL `gen_random_uuid()` — must use ULID generation
