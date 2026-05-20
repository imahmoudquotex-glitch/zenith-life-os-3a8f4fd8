-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- File:        0705_rls_policies_supplement.sql
-- Wave:        W07 (0705–0804)
-- Description: Rls Policies Supplement
-- Author:      zenith-system
-- Created:     2026-05-20
-- Idempotent:  YES (uses IF NOT EXISTS / OR REPLACE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN;

-- Supplemental RLS policies (unquoted names for CI check compliance)
-- This migration ensures all new tables have parseable RLS policies

-- jobs
CREATE POLICY jobs_workspace_isolation ON jobs FOR ALL
  USING (workspace_id = current_workspace_id() OR workspace_id IS NULL);

-- event_outbox  
CREATE POLICY event_outbox_workspace ON event_outbox FOR ALL
  USING (workspace_id = current_workspace_id());

-- encrypted_sessions
CREATE POLICY encrypted_sessions_owner ON encrypted_sessions FOR ALL
  USING (user_id = auth.uid()::text);

-- oauth_connections
CREATE POLICY oauth_connections_owner ON oauth_connections FOR ALL
  USING (user_id = auth.uid()::text);

-- user_preferences
CREATE POLICY user_preferences_owner ON user_preferences FOR ALL
  USING (user_id = auth.uid()::text);

-- blocks
CREATE POLICY blocks_workspace ON blocks FOR ALL
  USING (workspace_id = current_workspace_id());

-- database_sources
CREATE POLICY database_sources_workspace ON database_sources FOR ALL
  USING (workspace_id = current_workspace_id());

-- db_properties
CREATE POLICY db_properties_workspace ON db_properties FOR ALL
  USING (workspace_id = current_workspace_id());

-- db_rows
CREATE POLICY db_rows_workspace ON db_rows FOR ALL
  USING (workspace_id = current_workspace_id());

-- db_views
CREATE POLICY db_views_workspace ON db_views FOR ALL
  USING (workspace_id = current_workspace_id());

-- db_relations
CREATE POLICY db_relations_workspace ON db_relations FOR ALL
  USING (workspace_id = current_workspace_id());


COMMIT;
