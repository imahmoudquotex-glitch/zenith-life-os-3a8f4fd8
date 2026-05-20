# 0042-0050: Additional Wave 00 Architecture Contracts

## ADR-0042: CSP & Trusted Types
**Decision:** Implement strict Content-Security-Policy and require Trusted Types.
**Rationale:** Prevent XSS and unauthorized resource loading. Default-src 'self', script-src 'wasm-unsafe-eval' for local encryption, block unsafe inline scripts.

## ADR-0043: Crypto baseline
**Decision:** Enforce Argon2id for KDF, XChaCha20-Poly1305 for AEAD, and X25519/Ed25519 for sharing/signing.
**Rationale:** Modern, secure defaults. Ban AES-ECB, MD5, SHA1, 3DES, RC4.

## ADR-0044: SBOM + Signing
**Decision:** Generate CycloneDX SBOM and use Sigstore for artifact signing.
**Rationale:** Supply chain security. Maintain OSSF Scorecard >= 7.0.

## ADR-0045: Tenant isolation tests
**Decision:** Require daily cross-tenant pgTAP tests and chaos engineering.
**Rationale:** Guarantee RLS enforcement.

## ADR-0046: Desktop PWA contract
**Decision:** Design for desktop-first PWA, min 1024x640, offline caching.
**Rationale:** Deliver a robust native-like experience on desktop before considering mobile constraints.

## ADR-0047: Dark Mode invariant
**Decision:** Dark Mode is the only supported theme mode.
**Rationale:** Ensures consistent, focused visual experience and reduces styling edge cases.

## ADR-0048: Donations-only
**Decision:** All features are free forever. Only optional donations are accepted.
**Rationale:** Prevents feature gating and complexity.

## ADR-0049: AI Sensitivity Levels
**Decision:** Enforce 'none', 'low', 'medium', 'high' AI sensitivity per request.
**Rationale:** Protect sensitive vault or PII data from AI endpoints.

## ADR-0050: Time abstraction
**Decision:** Abstract time through `systemClock`. No direct `new Date()` in business logic.
**Rationale:** Predictable and testable time operations.
