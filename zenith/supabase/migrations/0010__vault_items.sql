-- File: 0010__vault_items.sql
-- Wave: 01
-- Description: Zero-Knowledge Vault — encrypted items (E2EE)
-- Author: Zenith Builder
-- Created: 2026-05-16
-- Idempotent: YES

BEGIN;

CREATE TABLE IF NOT EXISTS public.vault_items (
  id                TEXT PRIMARY KEY CHECK (public.is_ulid(id)),
  workspace_id      TEXT NOT NULL CHECK (public.is_ulid(workspace_id)),
  owner_user_id     TEXT NOT NULL CHECK (public.is_ulid(owner_user_id)),
  title_encrypted   BYTEA NOT NULL,
  content_encrypted BYTEA NOT NULL,
  wrapped_iek       BYTEA NOT NULL,
  nonce             BYTEA NOT NULL,
  encryption_algo   TEXT NOT NULL DEFAULT 'xchacha20-poly1305',
  key_version       INT NOT NULL DEFAULT 1,
  item_type         TEXT NOT NULL DEFAULT 'note' CHECK (item_type IN ('note', 'credential', 'document', 'other')),
  is_deleted        BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_vault_items_workspace FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id),
  CONSTRAINT fk_vault_items_owner FOREIGN KEY (owner_user_id) REFERENCES public.users(id),
  CONSTRAINT chk_vault_items_algo CHECK (encryption_algo IN ('xchacha20-poly1305'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vault_items_workspace_owner
  ON public.vault_items (workspace_id, owner_user_id) WHERE NOT is_deleted;

-- Auto-update trigger
DROP TRIGGER IF EXISTS trg_vault_items_update_set_updated_at ON public.vault_items;
CREATE TRIGGER trg_vault_items_update_set_updated_at
  BEFORE UPDATE ON public.vault_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: user can only access their own vault items within their workspace
ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_items FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vault_items_isolation ON public.vault_items;
CREATE POLICY vault_items_isolation ON public.vault_items
  FOR ALL
  USING (
    workspace_id = public.current_workspace_id()
    AND owner_user_id = public.current_user_id()
  )
  WITH CHECK (
    workspace_id = public.current_workspace_id()
    AND owner_user_id = public.current_user_id()
  );

GRANT SELECT, INSERT, UPDATE ON public.vault_items TO app_user;

COMMENT ON TABLE public.vault_items IS 'Zero-Knowledge Vault — all content E2EE, server never sees plaintext';

COMMIT;
