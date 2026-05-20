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
