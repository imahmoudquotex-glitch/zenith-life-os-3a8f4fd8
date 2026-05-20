# Security Policy

Report vulnerabilities via email only. Do NOT open public issues.
We acknowledge within 48 hours.

## Architecture
- Vault: ZKE (XChaCha20-Poly1305 + Argon2id) — server never sees plaintext
- Auth: Supabase Auth + local JWT verification
- CSRF: Double-submit cookie + Sec-Fetch-Site + Trusted Types
- CSP: Strict nonces + require-trusted-types-for script
- RLS: Row Level Security on all tenant tables
- AI: PII redaction before every AI call
- Audit: Tamper-evident hash chain

## Forbidden Algorithms
AES-ECB, MD5, SHA1, 3DES, RC4, PBKDF2 (vault)
