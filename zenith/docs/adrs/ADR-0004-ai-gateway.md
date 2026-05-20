# ADR-0004 — AI Gateway Pattern

**Date:** 2026-05-15
**Status:** Accepted

## Decision
All AI calls via runAIWithQuota() from @app/ai only.

## Invariants
No direct openai.* outside packages/ai/src/providers/.
Flow: redact -> reserve -> execute -> settle/refund -> audit.
Timeout: 30s. AI never receives vault plaintext.
