-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- File:        0220__rls_pack_w02.sql
-- Wave:        W02 (0220–0319)
-- Description:  Rls Pack W02
-- Author:      zenith-system
-- Created:     2026-05-20
-- Idempotent:  YES (uses IF NOT EXISTS / OR REPLACE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN;

-- 0220__rls_pack_w02.sql
-- Wave: W02
-- Purpose: Final RLS enforcement sweep — ensure every W02 tenant table has rowsecurity + FORCE

BEGIN;
-- Verify and enforce RLS on all W02 tables
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'tasks', 'notes', 'note_versions', 'habits', 'habit_checkins',
    'expenses', 'budgets', 'calendar_events', 'ai_usage', 'ai_usage_events',
    'xp_events', 'daily_reviews', 'import_jobs', 'public_shares'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', tbl);
  END LOOP;
END $$;
COMMIT;
