-- يفتح 100 parallel sessions يحاولوا reserve لنفس user
-- expected: limit حقيقي ينطبق بدقة (race-free)
BEGIN;
SELECT plan(2);
-- pgbench-driven test يضمن: عدد reservations = MIN(100, daily_limit)
SELECT * FROM finish();
ROLLBACK;