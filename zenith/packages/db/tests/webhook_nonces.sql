BEGIN;
SELECT plan(1);
-- Webhook nonces replay protection
SELECT ok(true, 'webhook_nonces replay test placeholder');
SELECT * FROM finish();
ROLLBACK;
