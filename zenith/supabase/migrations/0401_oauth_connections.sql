-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- File:        0401_oauth_connections.sql
-- Wave:        W04 (0401–0500)
-- Description: Oauth Connections
-- Author:      zenith-system
-- Created:     2026-05-20
-- Idempotent:  YES (uses IF NOT EXISTS / OR REPLACE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN;

-- W04: 0401_oauth_connections.sql
-- OAuth provider connections (GitHub, Google, etc.)
-- Wave: W04 (0400-0499)

CREATE TABLE IF NOT EXISTS oauth_connections (
  id              TEXT        NOT NULL DEFAULT gen_ulid(),
  user_id         TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id    TEXT        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider        TEXT        NOT NULL CHECK (provider IN ('github','google','apple','discord')),
  provider_user_id TEXT       NOT NULL,
  access_token_enc TEXT,                  -- encrypted with vault KEK
  refresh_token_enc TEXT,                 -- encrypted with vault KEK
  scopes          TEXT[]      NOT NULL DEFAULT '{}',
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id),
  CONSTRAINT oauth_connections_unique UNIQUE (user_id, provider)
);

CREATE INDEX IF NOT EXISTS oauth_connections_user_idx ON oauth_connections (user_id);

ALTER TABLE oauth_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_connections FORCE ROW LEVEL SECURITY;
CREATE POLICY "oauth_connections_owner_only"
  ON oauth_connections FOR ALL
  USING (user_id = auth.uid()::text);

SELECT create_updated_at_trigger('oauth_connections');



COMMIT;
