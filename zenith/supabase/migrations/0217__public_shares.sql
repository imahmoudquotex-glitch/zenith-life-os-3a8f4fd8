-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- File:        0217__public_shares.sql
-- Wave:        W02 (0217–0316)
-- Description:  Public Shares
-- Author:      zenith-system
-- Created:     2026-05-20
-- Idempotent:  YES (uses IF NOT EXISTS / OR REPLACE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN;

-- 0217__public_shares.sql
-- Wave: W02
-- Purpose: Public sharing tokens baseline — logic/rendering deferred to Wave 20

BEGIN;
CREATE TABLE IF NOT EXISTS public_shares (
  id           TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  resource_type TEXT NOT NULL,
  resource_id  TEXT NOT NULL,
  token        TEXT NOT NULL UNIQUE,
  created_by   TEXT NOT NULL REFERENCES users(id),
  password_hash TEXT,
  expires_at   TIMESTAMPTZ,
  revoked_at   TIMESTAMPTZ,
  view_count   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_public_shares_token ON public_shares(token) WHERE revoked_at IS NULL;
CREATE INDEX idx_public_shares_workspace ON public_shares(workspace_id, resource_type, resource_id);

CREATE TRIGGER trg_public_shares_before_update_set_updated_at
  BEFORE UPDATE ON public_shares
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE public_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_shares FORCE ROW LEVEL SECURITY;
-- Owner/admin can manage; public read via token is handled in service layer with service role
CREATE POLICY public_shares_isolation ON public_shares
  USING (workspace_id = current_workspace_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON public_shares TO app_user;
COMMIT;
