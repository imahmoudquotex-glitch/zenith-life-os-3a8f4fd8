# ADR-0006: Formula Engine — No Client-Side AST

**Status:** Accepted
**Date:** 2026-05-17

## Context

The original implementation stored AST in the database (`ast JSONB NOT NULL`) and allowed clients to send pre-parsed AST objects to the evaluate endpoint. This is a critical security vulnerability — a crafted AST could bypass type checking and inject arbitrary operations.

## Decision

1. **AST is NEVER stored in the database.** The `formula_definitions` table stores only the `expression` string.
2. **AST is NEVER accepted from the client.** The client sends the expression text; the server parses it.
3. **AST is NEVER sent to the client.** The validate endpoint returns only `{ valid: true, returnType }`.
4. **No `eval()` / `Function()` / dynamic import** anywhere in the formula engine.
5. **50ms timeout** enforced via `performance.now()`.

## Consequences

- Formulas are deterministic and safe
- Server-side parsing means slight latency, but security is absolute
- Dependencies are tracked in `formula_dependencies` table, not in AST
