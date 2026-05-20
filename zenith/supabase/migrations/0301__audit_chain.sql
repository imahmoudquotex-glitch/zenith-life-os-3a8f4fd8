-- Migration:    0301__audit_chain
-- Wave:         W03 (Security Fortress & Offline PWA)
-- Description:  Add prev_hash + row_hash to audit_events for tamper-evident Merkle chain
-- Created:      2026-05-16

BEGIN;

ALTER TABLE audit_events
  ADD COLUMN IF NOT EXISTS prev_hash BYTEA,
  ADD COLUMN IF NOT EXISTS row_hash  BYTEA;

CREATE OR REPLACE FUNCTION public.audit_compute_row_hash()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_prev BYTEA;
BEGIN
  -- Get previous row hash in this workspace (ordered by insertion time)
  SELECT row_hash INTO v_prev
    FROM audit_events
   WHERE workspace_id = NEW.workspace_id
   ORDER BY created_at DESC, id DESC
   LIMIT 1;

  NEW.prev_hash := COALESCE(v_prev, decode('00', 'hex'));

  NEW.row_hash := digest(
    COALESCE(NEW.workspace_id, '') || '|' ||
    COALESCE(NEW.actor_user_id, '') || '|' ||
    NEW.action || '|' ||
    COALESCE(NEW.resource_type, '') || '|' ||
    COALESCE(NEW.resource_id, '') || '|' ||
    NEW.created_at::text || '|' ||
    encode(NEW.prev_hash, 'hex'),
    'sha256'
  );

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_audit_chain ON audit_events;
CREATE TRIGGER trg_audit_chain
  BEFORE INSERT ON audit_events
  FOR EACH ROW EXECUTE FUNCTION public.audit_compute_row_hash();

-- Hardening: No UPDATE or DELETE on audit_events ever
REVOKE UPDATE, DELETE ON audit_events FROM app_user;

COMMENT ON COLUMN audit_events.prev_hash IS 'SHA-256 of the previous row (Merkle chain)';
COMMENT ON COLUMN audit_events.row_hash  IS 'SHA-256 of this row fields + prev_hash';

COMMIT;
