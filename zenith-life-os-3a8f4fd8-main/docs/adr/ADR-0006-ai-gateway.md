# ADR-0006: AI Gateway Architecture

**Status:** Accepted  
**Date:** 2026-05-17  
**Decision-Makers:** Architecture Team

## Context

AI features (summarization, tagging, suggestions) must use external LLM APIs. Direct SDK imports create vendor lock-in, quota bypass, and potential data leakage.

## Decision

1. **Central gateway**: All AI calls go through `@zenith/ai` gateway package.
2. **Direct import ban**: ESLint forbids `openai`, `@anthropic-ai/sdk`, `@ai-sdk/*` outside the gateway.
3. **Vault guard**: `assertNoVaultPlaintext()` scans all prompts before sending to AI providers.
4. **Quota enforcement**: Per-user daily token budgets managed at the gateway level.
5. **Audit logging**: Every AI request/response is logged with `@zenith/audit`.
6. **Redaction**: Sensitive patterns (API keys, passwords, SSN) are stripped from prompts.

## Invariants

- `I-005`: No direct AI SDK imports outside `packages/ai/`.
- CI gate `check-no-ai-direct-import.ts` enforces this.

## Consequences

- All AI features have a single point of control for cost, security, and audit
- Slightly higher latency from gateway overhead (~5ms)
- Provider switching requires changes only in the gateway
