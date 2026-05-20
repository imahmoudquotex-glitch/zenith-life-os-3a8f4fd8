-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- File:        0212__audit_logs_extend.sql
-- Wave:        W02 (0212–0311)
-- Description:  Audit Logs Extend
-- Author:      zenith-system
-- Created:     2026-05-20
-- Idempotent:  YES (uses IF NOT EXISTS / OR REPLACE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN;

-- 0212__audit_logs_extend.sql
-- Wave: W02
-- Purpose: Extend audit_events with request tracing fields (ADR-0039)

BEGIN;
ALTER TABLE audit_events
  ADD COLUMN IF NOT EXISTS request_id TEXT,
  ADD COLUMN IF NOT EXISTS session_id TEXT,
  ADD COLUMN IF NOT EXISTS trace_id TEXT;

CREATE INDEX IF NOT EXISTS idx_audit_events_request_id ON audit_events(request_id);
COMMIT;
