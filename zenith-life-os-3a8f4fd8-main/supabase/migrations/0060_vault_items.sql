-- Migration 0060: vault_items (Zero-Knowledge Encryption)
-- Reviewer issue #32, #43: vault_items table was missing
BEGIN;

CREATE TABLE public.vault_items (
  id            TEXT PRIMARY KEY CHECK (public.is_ulid(id)),
  workspace_id  TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  owner_user_id TEXT NOT NULL REFERENCES public.users(id),
  label         TEXT NOT NULL CHECK (length(label) BETWEEN 1 AND 200),
  category      TEXT NOT NULL DEFAULT 'note' CHECK (category IN ('note', 'password', 'api_key', 'document', 'financial', 'health')),
  encrypted_data TEXT NOT NULL,
  iv            TEXT NOT NULL,
  auth_tag      TEXT NOT NULL,
  key_version   INT NOT NULL DEFAULT 1,
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_archived   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_items FORCE ROW LEVEL SECURITY;

-- Vault items are ONLY accessible by their owner in their workspace
CREATE POLICY vault_items_owner_read ON public.vault_items
  FOR SELECT
  USING (
    owner_user_id = public.current_user_id()
    AND workspace_id = public.current_workspace_id()
  );

CREATE POLICY vault_items_owner_insert ON public.vault_items
  FOR INSERT
  WITH CHECK (
    owner_user_id = public.current_user_id()
    AND workspace_id = public.current_workspace_id()
  );

CREATE POLICY vault_items_owner_update ON public.vault_items
  FOR UPDATE
  USING (owner_user_id = public.current_user_id() AND workspace_id = public.current_workspace_id())
  WITH CHECK (owner_user_id = public.current_user_id() AND workspace_id = public.current_workspace_id());

CREATE POLICY vault_items_owner_delete ON public.vault_items
  FOR DELETE
  USING (owner_user_id = public.current_user_id() AND workspace_id = public.current_workspace_id());

CREATE INDEX idx_vault_items_workspace ON public.vault_items(workspace_id);
CREATE INDEX idx_vault_items_owner ON public.vault_items(owner_user_id, workspace_id);
CREATE INDEX idx_vault_items_category ON public.vault_items(workspace_id, category);

CREATE TRIGGER trg_vault_items_set_updated_at
  BEFORE UPDATE ON public.vault_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.vault_items IS 'Zero-knowledge encrypted vault. Only owner can decrypt. Never reaches AI/search/logs.';

COMMIT;
