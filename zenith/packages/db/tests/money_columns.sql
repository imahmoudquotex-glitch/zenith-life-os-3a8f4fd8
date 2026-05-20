BEGIN;
SELECT plan(1);
-- Ensure no numeric/float is used for money columns
SELECT is_empty(
  $$SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND column_name LIKE '%_cents' AND data_type NOT IN ('bigint', 'integer')$$,
  'Money columns must be BIGINT or INTEGER'
);
SELECT * FROM finish();
ROLLBACK;
