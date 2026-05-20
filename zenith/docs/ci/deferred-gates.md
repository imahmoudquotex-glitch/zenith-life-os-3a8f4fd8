# Deferred CI Gates

This document tracks all CI gates that belong to Phase 0-3 but have been deferred because the underlying features are not yet implemented. This prevents the repository from passing fake CI checks.

## Deferred Checks

| Check Command | Related Phase | Reason for Deferment |
|---------------|---------------|----------------------|
| `check:sw-audit` | Phase 0 (Desktop PWA) | Service Worker infrastructure is not yet built. Will be enforced when PWA is implemented. |
| `check:vapid-key-not-in-client` | Phase 0 (Web Push) | Web Push and VAPID keys are not yet configured. |
| `check:audit-merkle` | Phase 0/1 | Cryptographic tamper-proof audit trails are not yet fully implemented. |
| `check:zke-lang` | Phase 0 | Zero Knowledge Environment language validation is pending actual ZKE modules. |
| `check:ossf` | Phase 0 | OSSF Scorecard integration is deferred until repo achieves public MVP status or is integrated with OpenSSF services. |
