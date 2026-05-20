# Contributing to Zenith Life OS

## Quick Start

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

## Rules

### Git

- **Conventional Commits** — `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `ci:`
- **Squash-merge only** on PRs to `main`
- **Linear history** enforced

### Code

- TypeScript `strict` mode — zero `any`, zero `as` casts without justification
- ESLint `--max-warnings 0`
- Prettier: `printWidth 100`, `singleQuote true`, `trailingComma all`
- All IDs are `ULID TEXT` — no UUID/SERIAL
- Money is `*_cents BIGINT` — no floats
- Time via `Clock` abstraction — no `new Date()` in business logic
- `process.env.X` banned outside `packages/shared/src/env.ts`

### Database

- Every tenant table: `workspace_id TEXT NOT NULL` + RLS + FORCE RLS
- Migration header required (see `docs/conventions/naming.md`)
- `IF NOT EXISTS` + `BEGIN/COMMIT` in all migrations

### AI

- Single entrypoint: `runAIWithQuota` in `packages/ai`
- Vault content NEVER touches AI, analytics, audit, or logs
- Sensitivity levels: `none | low | medium | high` (`high` = blocked)

### Testing

- Vitest unit ≥85% coverage
- pgTAP 100% for RLS tables
- Playwright E2E for critical paths

### PR Checklist

- [ ] Conventional commit message
- [ ] TypeScript strict — no errors
- [ ] ESLint clean (`--max-warnings 0`)
- [ ] Tests pass
- [ ] CI scripts pass (`pnpm check:all`)
- [ ] No secrets in code
