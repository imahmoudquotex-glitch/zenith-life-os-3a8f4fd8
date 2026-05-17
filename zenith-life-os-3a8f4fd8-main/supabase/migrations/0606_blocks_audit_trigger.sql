-- Migration 0606 — Block Audit Trigger
-- Wave 06 — Block Editor
-- كل mutation على blocks تُسجّل في audit_logs
BEGIN;

CREATE TABLE IF NOT EXISTS public.block_audit_logs (
  id          TEXT PRIMARY KEY DEFAULT gen_ulid(),
  workspace_id TEXT NOT NULL,
  block_id    TEXT NOT NULL,
  action      TEXT NOT NULL CHECK (action IN ('create','update','delete','restore','reorder','convert')),
  actor_id    TEXT NOT NULL,
  before_json JSONB,
  after_json  JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_block_audit_block ON block_audit_logs(block_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_block_audit_workspace ON block_audit_logs(workspace_id, created_at DESC);

ALTER TABLE block_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_audit_logs FORCE ROW LEVEL SECURITY;

CREATE POLICY block_audit_isolation ON block_audit_logs
  USING (workspace_id = current_workspace_id());

-- Trigger function لتسجيل audit على blocks
CREATE OR REPLACE FUNCTION public.blocks_audit_trigger_fn()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO block_audit_logs(workspace_id, block_id, action, actor_id, after_json)
    VALUES (NEW.workspace_id, NEW.id, 'create', NEW.created_by_user_id, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO block_audit_logs(workspace_id, block_id, action, actor_id, before_json, after_json)
    VALUES (
      NEW.workspace_id, NEW.id,
      CASE WHEN NEW.is_deleted AND NOT OLD.is_deleted THEN 'delete'
           WHEN NEW.position <> OLD.position THEN 'reorder'
           ELSE 'update' END,
      NEW.last_edited_by_user_id,
      to_jsonb(OLD), to_jsonb(NEW)
    );
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_blocks_audit ON public.blocks;
CREATE TRIGGER trg_blocks_audit
  AFTER INSERT OR UPDATE ON public.blocks
  FOR EACH ROW EXECUTE FUNCTION public.blocks_audit_trigger_fn();

COMMENT ON TABLE block_audit_logs IS 'W06: Immutable audit trail for all block mutations.';

COMMIT;
