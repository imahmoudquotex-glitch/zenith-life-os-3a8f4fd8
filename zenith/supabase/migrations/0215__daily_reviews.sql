-- 0215__daily_reviews.sql
-- Wave: W02
-- Purpose: Daily review snapshots — one row per user per day for streak and reflection tracking

BEGIN;
CREATE TABLE IF NOT EXISTS daily_reviews (
  user_id      TEXT NOT NULL REFERENCES users(id),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  day_local    DATE NOT NULL,
  score        INT,
  snapshot_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, day_local)
);

CREATE INDEX idx_daily_reviews_workspace ON daily_reviews(workspace_id, day_local DESC);

CREATE TRIGGER trg_daily_reviews_before_update_set_updated_at
  BEFORE UPDATE ON daily_reviews
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE daily_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reviews FORCE ROW LEVEL SECURITY;
CREATE POLICY daily_reviews_isolation ON daily_reviews
  USING (workspace_id = current_workspace_id());
GRANT SELECT, INSERT, UPDATE ON daily_reviews TO app_user;
COMMIT;
