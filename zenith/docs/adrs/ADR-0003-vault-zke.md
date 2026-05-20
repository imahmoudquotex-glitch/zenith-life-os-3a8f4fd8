# ADR-0003 — Vault Zero-Knowledge Encryption

**Date:** 2026-05-15
**Status:** Accepted

## Decision
Two-layer envelope: Argon2id -> KEK -> wraps IEK -> encrypts plaintext (XChaCha20-Poly1305).
AAD = workspace_id|user_id|item_id|vN

## Forbidden
AES-ECB/GCM(vault), MD5, SHA1, 3DES, RC4, PBKDF2. isExtractable=true.

## Library
@noble/ciphers — audited, constant-time.
