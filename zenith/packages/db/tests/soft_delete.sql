BEGIN;
SELECT plan(1);
-- Soft delete test
SELECT ok(true, 'soft_delete test placeholder');
SELECT * FROM finish();
ROLLBACK;
