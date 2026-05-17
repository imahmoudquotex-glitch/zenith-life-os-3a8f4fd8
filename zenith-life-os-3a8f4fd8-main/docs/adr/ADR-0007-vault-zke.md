# ADR-0007: Vault Zero-Knowledge Encryption

**Status:** Accepted
**Date:** 2026-05-17

## Context

Users need to store sensitive data (passwords, API keys, health records). This data MUST be encrypted such that:
- Server never sees plaintext
- AI features never access vault data
- Search indexes never include vault data
- Admin/support staff cannot read vault data

## Decision

1. **Client-side encryption**: Data encrypted before leaving the browser using AES-256-GCM.
2. **Envelope encryption**: Each item encrypted with a Data Encryption Key (DEK), DEK encrypted with user's Key Encryption Key (KEK).
3. **`vault_items` table** stores only: `encrypted_data`, `iv`, `auth_tag`, `key_version`.
4. **RLS**: `owner_user_id + workspace_id` double-gated.
5. **AI exclusion**: `vault_inline` block type is never sent to AI gateway.
6. **Trigger guard**: `user_settings_force_vault_off()` prevents `allowVaultContext` from being enabled.

## Invariants

- `@zenith/crypto` is the ONLY package that handles vault operations
- `check-no-vault-leak.ts` CI script scans for plaintext vault data in logs/AI calls
- No vault data in search indexes (tsvector excludes `vault_inline` blocks)
