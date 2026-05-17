# ADR-0002: Zero-Knowledge Encryption (ZKE) Vault

**Status:** Accepted  
**Date:** 2026-05-17  
**Decision-Makers:** Architecture Team

## Context

Zenith Life OS handles sensitive user data: journal entries, health metrics, financial records, personal reflections. Users must own their encryption keys; the server must never possess plaintext access.

## Decision

Implement a Zero-Knowledge Encryption (ZKE) vault where:

1. **Client-side encryption**: All vault items are encrypted in the browser using AES-256-GCM before transmission.
2. **Key derivation**: User passphrase → PBKDF2 (100k iterations, SHA-256) → AES key. The passphrase never leaves the client.
3. **Envelope schema**: Each vault entry stores `{ ciphertext, iv, salt, version }` as JSONB in Supabase.
4. **Server-side blindness**: The server stores only ciphertext. RLS policies prevent even service-role reads of raw vault data.
5. **Key rotation**: Version field enables re-encryption with new keys without data loss.

## Invariants

- `I-003`: No plaintext vault data may appear in logs, AI prompts, or API responses.
- CI gate `check-no-vault-leak.ts` scans for plaintext patterns.
- AI gateway `assertNoVaultPlaintext()` blocks sensitive markers.

## Consequences

- Password recovery requires user-managed backup keys
- Full-text search on encrypted fields requires client-side decryption
- Increased client CPU for encryption/decryption operations
