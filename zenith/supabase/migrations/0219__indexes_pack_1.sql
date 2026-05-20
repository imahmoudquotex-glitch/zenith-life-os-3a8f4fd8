-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- File:        0219__indexes_pack_1.sql
-- Wave:        W02 (0219–0318)
-- Description:  Indexes Pack 1
-- Author:      zenith-system
-- Created:     2026-05-20
-- Idempotent:  YES (uses IF NOT EXISTS / OR REPLACE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN;

-- 0219__indexes_pack_1.sql
-- Wave: W02
-- Purpose: Additional indexes pack for W02 tables — performance hardening

BEGIN;
-- notes full-text search update trigger
CREATE OR REPLACE FUNCTION notes_update_tsv() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_tsv :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.content_md, '')), 'B');
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notes_tsv_update
  BEFORE INSERT OR UPDATE OF title, content_md ON notes
  FOR EACH ROW EXECUTE FUNCTION notes_update_tsv();

-- tasks: additional composite for open tasks by user
CREATE INDEX IF NOT EXISTS idx_tasks_user_open
  ON tasks(user_id, workspace_id, due_at)
  WHERE status IN ('open','in_progress') AND is_deleted = false;

-- habits: composite for active habits
CREATE INDEX IF NOT EXISTS idx_habits_workspace_active
  ON habits(workspace_id, user_id)
  WHERE is_archived = false AND is_deleted = false;

-- ai_usage_events: status for reporting
CREATE INDEX IF NOT EXISTS idx_ai_usage_events_status
  ON ai_usage_events(workspace_id, status, created_at DESC);

-- calendar_events: external id lookup
CREATE INDEX IF NOT EXISTS idx_calendar_events_external
  ON calendar_events(workspace_id, source, external_id)
  WHERE external_id IS NOT NULL AND is_deleted = false;

-- expenses: user-level spending
CREATE INDEX IF NOT EXISTS idx_expenses_user_spent
  ON expenses(user_id, spent_at DESC)
  WHERE is_deleted = false;
COMMIT;
