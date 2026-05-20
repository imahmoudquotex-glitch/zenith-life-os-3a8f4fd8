-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- File:        0131_event_outbox.sql
-- Wave:        W01 (0131–0230)
-- Description: Event Outbox
-- Author:      zenith-system
-- Created:     2026-05-20
-- Idempotent:  YES (uses IF NOT EXISTS / OR REPLACE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN;

-- W01: 0131_event_outbox.sql
-- Transactional outbox for reliable event publishing
-- Wave: W01 (0100-0199)

CREATE TABLE IF NOT EXISTS event_outbox (
  id              TEXT        NOT NULL DEFAULT gen_ulid(),
  event_type      TEXT        NOT NULL,
  payload         JSONB       NOT NULL DEFAULT '{}',
  workspace_id    TEXT        REFERENCES workspaces(id) ON DELETE CASCADE,
  published       BOOLEAN     NOT NULL DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  attempts        INTEGER     NOT NULL DEFAULT 0,
  last_error      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS event_outbox_unpublished_idx
  ON event_outbox (created_at ASC)
  WHERE published = FALSE;

CREATE INDEX IF NOT EXISTS event_outbox_workspace_idx ON event_outbox (workspace_id);

-- RLS
ALTER TABLE event_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_outbox FORCE ROW LEVEL SECURITY;
CREATE POLICY "event_outbox_workspace_isolation"
  ON event_outbox FOR ALL
  USING (workspace_id = current_workspace_id());



COMMIT;
