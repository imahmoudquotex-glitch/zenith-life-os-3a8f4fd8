-- 0301__audit_chain.sql
-- Wave: W03
BEGIN;
ALTER TABLE audit_events
  ADD COLUMN IF NOT EXISTS prev_hash BYTEA,
  ADD COLUMN IF NOT EXISTS row_hash  BYTEA;

CREATE OR REPLACE FUNCTION public.audit_compute_row_hash()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_prev BYTEA;
BEGIN
  SELECT row_hash INTO v_prev FROM audit_events
   WHERE workspace_id = NEW.workspace_id
   ORDER BY created_at DESC, id DESC LIMIT 1;
  NEW.prev_hash := COALESCE(v_prev, decode('00','hex'));
  NEW.row_hash := digest(
    coalesce(NEW.workspace_id,'') || '|' ||
    coalesce(NEW.actor_id,'') || '|' ||
    NEW.action || '|' ||
    coalesce(NEW.target_type,'') || '|' ||
    coalesce(NEW.target_id,'') || '|' ||
    NEW.created_at::text || '|' ||
    encode(NEW.prev_hash,'hex'),
    'sha256');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_audit_chain ON audit_events;
CREATE TRIGGER trg_audit_chain BEFORE INSERT ON audit_events
FOR EACH ROW EXECUTE FUNCTION audit_compute_row_hash();

REVOKE UPDATE, DELETE ON audit_events FROM app_user;
COMMIT;
