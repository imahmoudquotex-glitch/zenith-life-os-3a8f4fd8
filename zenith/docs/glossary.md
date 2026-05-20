# Zenith Glossary

| Term | Definition |
|------|-----------|
| **ULID** | Universally Unique Lexicographically Sortable Identifier. 26-char Crockford Base32. |
| **RLS** | Row Level Security. Postgres feature enforcing tenant isolation at DB level. |
| **FORCE RLS** | Ensures RLS applies even to table owners (prevents bypass). |
| **ZKE** | Zero-Knowledge Encryption. Server never sees plaintext vault content. |
| **MK** | Master Key. Derived from user passphrase via Argon2id. In-memory only. |
| **IEK** | Item Encryption Key. Random per vault item. Encrypted by MK. |
| **AEAD** | Authenticated Encryption with Associated Data. XChaCha20-Poly1305. |
| **Envelope** | Standard API response format: `{ok, data?, error?, meta}`. |
| **Branded Type** | TypeScript pattern using intersection with `__brand` for nominal typing. |
| **Cents** | Monetary values stored as integer cents (BIGINT). No floating-point. |
| **Clock** | Abstraction over `Date.now()`. Allows deterministic testing. |
| **Result** | `Ok<T> \| Err<E>` type for explicit error handling without throw/catch. |
| **Idempotency Key** | Client-generated key preventing duplicate mutations on retry. |
| **Cursor Pagination** | Opaque cursor-based paging. No offset. O(1) performance. |
| **Sensitivity Level** | AI content classification: none \| low \| medium \| high. |
| **Whisper Mode** | Global toggle disabling all AI features for a user. |
| **Feature Flag** | Runtime toggle for feature rollout without deploy. |
| **SBOM** | Software Bill of Materials. CycloneDX format. |
| **PITR** | Point-In-Time Recovery. Database backup restoration to specific moment. |
| **SLO** | Service Level Objective. Target reliability metric. |
| **PWA** | Progressive Web App. Desktop-first installable web application. |
| **ADR** | Architecture Decision Record. Documented rationale for technical choices. |
| **pgTAP** | PostgreSQL testing framework for RLS and DB logic. |
| **Workspace** | Tenant unit. All data is scoped to a workspace_id. |
