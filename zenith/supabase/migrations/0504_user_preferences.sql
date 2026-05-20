-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- File:        0504_user_preferences.sql
-- Wave:        W05 (0504–0603)
-- Description: User Preferences
-- Author:      zenith-system
-- Created:     2026-05-20
-- Idempotent:  YES (uses IF NOT EXISTS / OR REPLACE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN;

-- W05: 0504_user_preferences.sql
-- Per-user preferences (language, timezone, notifications)
-- Wave: W05 (0500-0599)

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id         TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id    TEXT        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  locale          TEXT        NOT NULL DEFAULT 'ar',
  timezone        TEXT        NOT NULL DEFAULT 'Africa/Cairo',
  date_format     TEXT        NOT NULL DEFAULT 'DD/MM/YYYY',
  time_format     TEXT        NOT NULL DEFAULT '24h',
  sidebar_collapsed BOOLEAN   NOT NULL DEFAULT FALSE,
  notifications   JSONB       NOT NULL DEFAULT '{"email":true,"push":true,"digest":"daily"}',
  ai_enabled      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, workspace_id),
  CONSTRAINT user_prefs_locale CHECK (locale IN ('ar','en')),
  CONSTRAINT user_prefs_timezone CHECK (char_length(timezone) > 0)
);

CREATE INDEX IF NOT EXISTS user_preferences_workspace_idx ON user_preferences (workspace_id);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences FORCE ROW LEVEL SECURITY;
CREATE POLICY "user_preferences_owner_only"
  ON user_preferences FOR ALL
  USING (user_id = auth.uid()::text);

SELECT create_updated_at_trigger('user_preferences');



COMMIT;
