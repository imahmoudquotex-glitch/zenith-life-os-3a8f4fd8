# Testing Debt

This document tracks intentional testing debt, specifically the usage of `--passWithNoTests` in CI gates.

## Phase 0/1 Status
Currently, many monorepo packages (e.g., `client-env`, `server-env`, `auth-guard`) are foundational structural skeletons without business logic.
To prevent CI from failing due to `No test files found`, we append `--passWithNoTests` to the `vitest run` command.

## Resolution Plan
- **Before Phase 04 Freeze**: We must implement at least one smoke test per crucial package to prove test infrastructure.
- **Phase 04 onwards**: All business logic must be accompanied by actual tests, and the `--passWithNoTests` flag will be heavily monitored or removed.
