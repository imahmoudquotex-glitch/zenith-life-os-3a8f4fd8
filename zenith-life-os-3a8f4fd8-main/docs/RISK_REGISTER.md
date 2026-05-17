# Risk Register — Zenith Life OS

> Living document tracking known risks, their severity, and mitigation status.

| # | Risk | Severity | Status | Mitigation |
|---|------|----------|--------|------------|
| R-001 | Client-side AST execution (RCE-shaped) | **CRITICAL** | ✅ Fixed | Server-side parse only. AST from client rejected. See ADR-0006. |
| R-002 | localStorage token storage (XSS → full account takeover) | **CRITICAL** | ✅ Fixed | `persistSession: false`. Cookies httpOnly planned. |
| R-003 | No CSP headers (XSS injection) | **HIGH** | ✅ Fixed | CSP with nonce in `server.ts`. |
| R-004 | RLS `USING(true)` on formula_cache/jobs | **HIGH** | ✅ Fixed | Replaced with `is_system_context()` check. |
| R-005 | UUID in business tables (ID collision, no ordering) | **HIGH** | ✅ Fixed | All business IDs are TEXT ULID with `is_ulid()` CHECK. |
| R-006 | Creator-based RLS blocks collaboration | **HIGH** | ✅ Fixed | Workspace-based RLS via `current_workspace_id()`. |
| R-007 | Missing CSRF protection on mutations | **HIGH** | ⏳ Pending | Requires server-side CSRF token middleware. Wave 03. |
| R-008 | No rate limiting on auth endpoints | **MEDIUM** | ⏳ Pending | Requires CF Workers rate-limit or custom counter. Wave 03. |
| R-009 | No audit trail for auth events | **MEDIUM** | ⏳ Pending | `auth_events` table + audit logger. Wave 03. |
| R-010 | Formula engine `any` types (type confusion) | **MEDIUM** | ✅ Fixed | FormulaValue discriminated union created. |
| R-011 | JS coercion in formula operations | **MEDIUM** | ✅ Fixed | Typed operations with explicit type checks. |
| R-012 | Missing blocked identifiers in tokenizer | **MEDIUM** | ✅ Fixed | 20+ dangerous identifiers blocked. |
| R-013 | No Service Worker (offline UX, cache policy) | **MEDIUM** | ⏳ Pending | `sw.ts` with deny-list for sensitive routes. Wave 03. |
| R-014 | Direct AI provider imports (lock-in, audit bypass) | **MEDIUM** | ✅ Fixed | ESLint rule + CI gate bans direct imports. |
| R-015 | No vault plaintext leak detection | **MEDIUM** | ✅ Fixed | `assertNoVaultPlaintext()` guard in AI gateway. |
| R-016 | Mixed stack (Next.js + TanStack) | **HIGH** | ✅ Fixed | Next.js remnants deleted. ADR-0001 documents decision. |
| R-017 | package-lock.json + bun.lock (dependency drift) | **MEDIUM** | ✅ Fixed | Deleted. pnpm-only with `packageManager` field. |
| R-018 | Frozen waves as Markdown (not Git tags) | **LOW** | ⏳ Pending | Will create real Git tags after full gates pass. |
