BEGIN;
-- audit_events موجود من W00 — هنا بنوسعه
ALTER TABLE audit_events
  ADD COLUMN IF NOT EXISTS request_id TEXT,
  ADD COLUMN IF NOT EXISTS session_id TEXT,
  ADD COLUMN IF NOT EXISTS trace_id TEXT;
CREATE INDEX IF NOT EXISTS idx_audit_events_request_id ON audit_events(request_id);
COMMIT;