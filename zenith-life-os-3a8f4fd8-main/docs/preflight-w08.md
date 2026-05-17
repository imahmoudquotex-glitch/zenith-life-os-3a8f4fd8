# Pre-flight W08: Formula Engine

## Handshake
- [x] `w07-frozen` verified.
- [x] Required inputs handshake complete.
- [x] Redis connected or DB-fallback enabled.

## Blocked / Stubs
None identified yet. All previous dependencies (db-engine, properties) are ready.

## Scope Limits
- No client-side authoritative compute.
- No dynamic JS evaluation (`eval`, `Function`, `new Function`).
- Execution timeout strictly 50ms.
- 40+ pre-defined functions.
