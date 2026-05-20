-- File: 0203__expenses.sql
-- Wave: 03
-- Description: Expenses and budgets with BIGINT cents (ADR-0005)
-- Author: Zenith Builder
-- Created: 2026-05-20
-- Idempotent: YES

BEGIN;

-- Expense categories
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id            TEXT PRIMARY KEY,
  workspace_id  TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  color         TEXT,
  icon          TEXT,
  is_system     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_expense_category_name CHECK (length(name) BETWEEN 1 AND 100)
);

CREATE INDEX idx_expense_categories_workspace ON public.expense_categories(workspace_id);

ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories FORCE ROW LEVEL SECURITY;
CREATE POLICY expense_categories_isolation ON public.expense_categories
  USING (workspace_id = current_setting('app.current_workspace_id', true));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expense_categories TO app_user;

-- Expenses (all monetary values in _cents BIGINT per ADR-0005)
CREATE TABLE IF NOT EXISTS public.expenses (
  id              TEXT PRIMARY KEY,
  workspace_id    TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  category_id     TEXT REFERENCES public.expense_categories(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  amount_cents    BIGINT NOT NULL,         -- ADR-0005: cents only, integer always
  currency        CHAR(3) NOT NULL DEFAULT 'EGP'
                    CHECK (currency IN ('USD','EUR','GBP','EGP','SAR','AED','QAR','KWD','BHD','OMR','JOD')),
  expense_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  description     TEXT,
  receipt_url     TEXT,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  creator_user_id TEXT NOT NULL REFERENCES public.users(id),
  is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_expenses_title CHECK (length(title) BETWEEN 1 AND 300),
  CONSTRAINT chk_expenses_amount_positive CHECK (amount_cents > 0)
);

CREATE INDEX idx_expenses_workspace_date ON public.expenses(workspace_id, expense_date DESC) WHERE NOT is_deleted;
CREATE INDEX idx_expenses_category ON public.expenses(category_id) WHERE category_id IS NOT NULL;

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses FORCE ROW LEVEL SECURITY;
CREATE POLICY expenses_workspace_isolation ON public.expenses
  USING (workspace_id = current_setting('app.current_workspace_id', true));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO app_user;
CREATE TRIGGER trg_expenses_updated_at BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Budgets (all monetary values in _cents BIGINT per ADR-0005)
CREATE TABLE IF NOT EXISTS public.budgets (
  id              TEXT PRIMARY KEY,
  workspace_id    TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  category_id     TEXT REFERENCES public.expense_categories(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  amount_cents    BIGINT NOT NULL,         -- ADR-0005
  currency        CHAR(3) NOT NULL DEFAULT 'EGP'
                    CHECK (currency IN ('USD','EUR','GBP','EGP','SAR','AED','QAR','KWD','BHD','OMR','JOD')),
  period          TEXT NOT NULL DEFAULT 'monthly'
                    CHECK (period IN ('weekly','monthly','quarterly','yearly','custom')),
  period_start    DATE NOT NULL,
  period_end      DATE,
  creator_user_id TEXT NOT NULL REFERENCES public.users(id),
  is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_budgets_name CHECK (length(name) BETWEEN 1 AND 200),
  CONSTRAINT chk_budgets_amount_positive CHECK (amount_cents > 0)
);

CREATE INDEX idx_budgets_workspace ON public.budgets(workspace_id, period_start DESC) WHERE NOT is_deleted;

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets FORCE ROW LEVEL SECURITY;
CREATE POLICY budgets_workspace_isolation ON public.budgets
  USING (workspace_id = current_setting('app.current_workspace_id', true));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.budgets TO app_user;
CREATE TRIGGER trg_budgets_updated_at BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMIT;
