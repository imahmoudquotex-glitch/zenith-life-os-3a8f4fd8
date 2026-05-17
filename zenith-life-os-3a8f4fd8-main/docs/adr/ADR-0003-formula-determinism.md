# ADR-0003: Formula Engine Determinism

**Status:** Accepted  
**Date:** 2026-05-17  
**Decision-Makers:** Architecture Team

## Context

Formula evaluation must produce identical results for the same inputs to ensure cache validity, audit consistency, and debuggability.

## Decision

1. **No `Date.now()` or `new Date()` in formula execution**: The `now()` function receives a frozen timestamp from `FormulaRuntime.now` injected by the evaluator.
2. **Timeout enforcement**: All evaluations enforce a 50ms hard timeout to prevent DoS from complex expressions.
3. **Blocked identifiers**: 20+ dangerous JS identifiers (eval, Function, constructor, etc.) are rejected at tokenization time.
4. **Pure operations**: All formula operations use explicit type checking (FormulaValue discriminated union) with no JS coercion.
5. **No `eval()` or `new Function()`**: Formula expressions are parsed into a safe AST and evaluated via tree-walking.

## Invariants

- `I-006`: No `eval`, `Function`, or dynamic import in formula engine code.
- CI gate `check-no-eval.ts` scans entire codebase.
- Tokenizer blocklist rejects 20+ identifiers.

## Consequences

- Slightly more complex formula architecture
- Runtime overhead from AST walking vs. native eval (acceptable, <50ms)
- Deterministic caching and audit trail guaranteed
