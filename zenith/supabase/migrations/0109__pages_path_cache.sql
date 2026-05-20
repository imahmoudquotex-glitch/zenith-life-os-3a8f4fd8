-- File: 0109__pages_path_cache.sql
-- Wave: 02
-- Description: Materialized path cache placeholder (activate if recursive CTE is slow)
-- Author: Zenith Builder
-- Created: 2026-05-16
-- Idempotent: YES

BEGIN;

-- Intentionally empty — recursive CTE performance will be measured first.
-- If page_descendants() or page_ancestors() exceed p95 budgets (50ms / 30ms),
-- this migration will be populated with a materialized path column + trigger.
-- See: docs/perf-budgets-w02.md

COMMIT;
