-- 0202__profiles_extend.sql
-- Wave: W02
-- Purpose: Extend users table with plan, daily review streak, and timezone fields

BEGIN;
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS daily_review_streak INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'UTC';

ALTER TABLE users
  ADD CONSTRAINT chk_users_plan CHECK (plan IN ('free', 'pro', 'team', 'enterprise'));
COMMIT;
