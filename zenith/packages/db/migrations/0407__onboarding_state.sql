-- 0407__onboarding_state.sql — Wave W04
BEGIN;
CREATE TABLE IF NOT EXISTS onboarding_state (
  user_id         TEXT PRIMARY KEY REFERENCES users(id),
  current_step    TEXT NOT NULL DEFAULT 'locale',
  completed_steps TEXT[] NOT NULL DEFAULT '{}',
  payload         JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  CONSTRAINT chk_onboarding_step CHECK (current_step IN ('locale','profile','timezone','workspace','done'))
);
COMMIT;
