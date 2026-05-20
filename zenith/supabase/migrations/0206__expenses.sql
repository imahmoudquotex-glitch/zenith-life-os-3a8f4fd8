-- 0206__expenses.sql
-- Wave: W02
-- Purpose: Expenses + budgets tables — money stored as BIGINT cents ONLY, no NUMERIC/FLOAT

BEGIN;
CREATE TABLE IF NOT EXISTS expenses (
  id              TEXT PRIMARY KEY,
  workspace_id    TEXT NOT NULL REFERENCES workspaces(id),
  user_id         TEXT NOT NULL REFERENCES users(id),
  amount_cents    BIGINT NOT NULL,
  currency        CHAR(3) NOT NULL DEFAULT 'USD',
  category        TEXT NOT NULL DEFAULT 'general',
  description     TEXT,
  spent_at        DATE NOT NULL,
  is_recurring    BOOLEAN NOT NULL DEFAULT false,
  is_deleted      BOOLEAN NOT NULL DEFAULT false,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_expenses_amount_nonneg CHECK (amount_cents >= 0),
  CONSTRAINT chk_expenses_currency CHECK (currency ~ '^[A-Z]{3}$')
);

CREATE INDEX idx_expenses_workspace_spent ON expenses(workspace_id, spent_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_expenses_workspace_category ON expenses(workspace_id, category) WHERE is_deleted = false;

CREATE TABLE IF NOT EXISTS budgets (
  id              TEXT PRIMARY KEY,
  workspace_id    TEXT NOT NULL REFERENCES workspaces(id),
  user_id         TEXT NOT NULL REFERENCES users(id),
  category        TEXT NOT NULL,
  monthly_limit_cents BIGINT NOT NULL,
  currency        CHAR(3) NOT NULL DEFAULT 'USD',
  is_deleted      BOOLEAN NOT NULL DEFAULT false,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_budgets_limit_nonneg CHECK (monthly_limit_cents >= 0),
  UNIQUE (workspace_id, user_id, category)
);

CREATE TRIGGER trg_expenses_before_update_set_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_budgets_before_update_set_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses FORCE ROW LEVEL SECURITY;
CREATE POLICY expenses_isolation ON expenses USING (workspace_id = current_workspace_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON expenses TO app_user;

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets FORCE ROW LEVEL SECURITY;
CREATE POLICY budgets_isolation ON budgets USING (workspace_id = current_workspace_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON budgets TO app_user;
COMMIT;
