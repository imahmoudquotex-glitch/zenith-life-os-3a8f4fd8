BEGIN;
SELECT plan(1);
-- Triggers test
SELECT ok(true, 'triggers test placeholder');
SELECT * FROM finish();
ROLLBACK;
