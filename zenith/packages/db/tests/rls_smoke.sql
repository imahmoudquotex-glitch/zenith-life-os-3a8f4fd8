BEGIN;
SELECT plan(10);

-- User A
SET LOCAL app.current_user_id = 'usr_a';
SET LOCAL app.current_workspace_id = 'ws_a';
SELECT lives_ok($$INSERT INTO tasks(id, workspace_id, user_id, title, position_key) VALUES ('tsk_1','ws_a','usr_a','A1','k1')$$,
  'A: can insert own task');
SELECT is((SELECT count(*) FROM tasks WHERE id='tsk_1'), 1::bigint, 'A: sees own task');

-- User B different workspace
SET LOCAL app.current_user_id = 'usr_b';
SET LOCAL app.current_workspace_id = 'ws_b';
SELECT is((SELECT count(*) FROM tasks WHERE id='tsk_1'), 0::bigint, 'B: cannot see A task');
SELECT throws_ok($$UPDATE tasks SET title='hack' WHERE id='tsk_1'$$, 'B: cannot update A task');

-- Without context
RESET app.current_workspace_id;
RESET app.current_user_id;
SELECT is((SELECT count(*) FROM tasks), 0::bigint, 'no context = 0 rows');

-- Audit isolation
SET LOCAL app.current_workspace_id = 'ws_a';
SET LOCAL app.current_user_id = 'usr_a';
SELECT is((SELECT count(*) FROM audit_events WHERE workspace_id != 'ws_a'), 0::bigint, 'audit isolated');

-- AI usage isolation
SELECT is((SELECT count(*) FROM ai_usage WHERE user_id != 'usr_a'), 0::bigint, 'ai_usage isolated');

-- Vault isolation per user
SELECT is((SELECT count(*) FROM vault_items WHERE owner_user_id != 'usr_a'), 0::bigint, 'vault isolated per user');

-- Money type check
SELECT is(
  (SELECT data_type FROM information_schema.columns WHERE table_name='expenses' AND column_name='amount_cents'),
  'bigint', 'amount stored as bigint');

-- RLS forced on all tenant tables
SELECT is(
  (SELECT count(*) FROM pg_tables WHERE schemaname='public' AND tablename IN (
    'tasks','notes','habits','habit_checkins','expenses','budgets','calendar_events',
    'workspace_invitations','pages','page_permissions','ai_usage_events') AND rowsecurity=true),
  11::bigint, 'all W02 tables have RLS');

SELECT * FROM finish();
ROLLBACK;