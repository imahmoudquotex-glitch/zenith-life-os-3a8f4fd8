-- 0213__rate_limit_extend.sql
-- Wave: W02
-- Purpose: Extend rate_limit_buckets with DB fallback fields when Redis is unavailable

BEGIN;
ALTER TABLE rate_limit_buckets
  ADD COLUMN IF NOT EXISTS algorithm TEXT NOT NULL DEFAULT 'sliding_window',
  ADD COLUMN IF NOT EXISTS window_seconds INT NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS max_requests INT NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS retry_after_seconds INT NOT NULL DEFAULT 60;
COMMIT;
