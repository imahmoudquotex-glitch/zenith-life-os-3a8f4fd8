-- 0218__outbound_emails_extend.sql
-- Wave: W02
-- Purpose: Extend outbound_emails queue with provider tracking, retry, and dead-letter fields

BEGIN;
ALTER TABLE outbound_emails
  ADD COLUMN IF NOT EXISTS provider_message_id TEXT,
  ADD COLUMN IF NOT EXISTS retry_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS dead_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS attempt_count INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_outbound_emails_retry_at
  ON outbound_emails(retry_at)
  WHERE retry_at IS NOT NULL AND dead_at IS NULL;
COMMIT;
