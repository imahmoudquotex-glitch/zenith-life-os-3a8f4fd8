BEGIN;

-- ============================================================
-- 0717: db_system_seeds — Tasks/Habits/Expenses/Notes/Goals/Projects
-- ============================================================

-- Function called on workspace creation to seed system DBs
CREATE OR REPLACE FUNCTION seed_system_databases(p_workspace_id TEXT, p_user_id TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
  v_tasks_id    TEXT := generate_ulid();
  v_habits_id   TEXT := generate_ulid();
  v_expenses_id TEXT := generate_ulid();
  v_notes_id    TEXT := generate_ulid();
  v_goals_id    TEXT := generate_ulid();
  v_projects_id TEXT := generate_ulid();
  v_view_id     TEXT;
  v_prop_id     TEXT;
BEGIN
  -- ── TASKS ─────────────────────────────────────────────────
  INSERT INTO databases (id, workspace_id, title, is_system, created_by_user_id)
  VALUES (v_tasks_id, p_workspace_id, 'Tasks', TRUE, p_user_id);

  -- title property (primary)
  INSERT INTO db_properties (id, database_id, workspace_id, name, type, is_primary, is_system, position)
  VALUES (generate_ulid(), v_tasks_id, p_workspace_id, 'Task', 'title', TRUE, TRUE, 0);

  -- status property
  INSERT INTO db_properties (id, database_id, workspace_id, name, type, config, is_system, position)
  VALUES (generate_ulid(), v_tasks_id, p_workspace_id, 'Status', 'status', 
    '{"options":[{"id":"todo","name":"Todo","color":"gray","group":"todo"},{"id":"in_progress","name":"In Progress","color":"blue","group":"in_progress"},{"id":"done","name":"Done","color":"green","group":"done"}]}'::jsonb,
    TRUE, 1);

  -- priority
  INSERT INTO db_properties (id, database_id, workspace_id, name, type, config, is_system, position)
  VALUES (generate_ulid(), v_tasks_id, p_workspace_id, 'Priority', 'select',
    '{"options":[{"id":"low","name":"Low","color":"gray"},{"id":"medium","name":"Medium","color":"yellow"},{"id":"high","name":"High","color":"red"},{"id":"urgent","name":"Urgent","color":"red"}]}'::jsonb,
    TRUE, 2);

  -- due_date
  INSERT INTO db_properties (id, database_id, workspace_id, name, type, config, is_system, position)
  VALUES (generate_ulid(), v_tasks_id, p_workspace_id, 'Due Date', 'date', '{}'::jsonb, TRUE, 3);

  -- assignee
  INSERT INTO db_properties (id, database_id, workspace_id, name, type, config, is_system, position)
  VALUES (generate_ulid(), v_tasks_id, p_workspace_id, 'Assignee', 'person', '{}'::jsonb, TRUE, 4);

  -- tags
  INSERT INTO db_properties (id, database_id, workspace_id, name, type, config, is_system, position)
  VALUES (generate_ulid(), v_tasks_id, p_workspace_id, 'Tags', 'multi_select', '{"options":[]}'::jsonb, TRUE, 5);

  -- Default Board view (grouped by status)
  v_view_id := generate_ulid();
  INSERT INTO db_views (id, database_id, workspace_id, name, type, config, is_default, position)
  VALUES (v_view_id, v_tasks_id, p_workspace_id, 'Board', 'board',
    '{"groupBy":"Status","rowHeight":"medium"}'::jsonb, TRUE, 0);

  -- Table view
  INSERT INTO db_views (id, database_id, workspace_id, name, type, config, position)
  VALUES (generate_ulid(), v_tasks_id, p_workspace_id, 'All Tasks', 'table',
    '{"rowHeight":"compact"}'::jsonb, 1);

  -- ── HABITS ─────────────────────────────────────────────────
  INSERT INTO databases (id, workspace_id, title, is_system, created_by_user_id)
  VALUES (v_habits_id, p_workspace_id, 'Habits', TRUE, p_user_id);

  INSERT INTO db_properties (id, database_id, workspace_id, name, type, is_primary, is_system, position)
  VALUES (generate_ulid(), v_habits_id, p_workspace_id, 'Habit', 'title', TRUE, TRUE, 0);

  INSERT INTO db_properties (id, database_id, workspace_id, name, type, config, is_system, position)
  VALUES (generate_ulid(), v_habits_id, p_workspace_id, 'Frequency', 'select',
    '{"options":[{"id":"daily","name":"Daily","color":"blue"},{"id":"weekly","name":"Weekly","color":"green"},{"id":"monthly","name":"Monthly","color":"purple"}]}'::jsonb,
    TRUE, 1);

  INSERT INTO db_properties (id, database_id, workspace_id, name, type, config, is_system, position)
  VALUES (generate_ulid(), v_habits_id, p_workspace_id, 'Streak', 'number', '{"format":"number"}'::jsonb, TRUE, 2);

  INSERT INTO db_properties (id, database_id, workspace_id, name, type, config, is_system, position)
  VALUES (generate_ulid(), v_habits_id, p_workspace_id, 'Completed Today', 'checkbox', '{}'::jsonb, TRUE, 3);

  INSERT INTO db_views (id, database_id, workspace_id, name, type, config, is_default, position)
  VALUES (generate_ulid(), v_habits_id, p_workspace_id, 'Habits', 'table',
    '{"rowHeight":"compact"}'::jsonb, TRUE, 0);

  -- ── EXPENSES ─────────────────────────────────────────────────
  INSERT INTO databases (id, workspace_id, title, is_system, created_by_user_id)
  VALUES (v_expenses_id, p_workspace_id, 'Expenses', TRUE, p_user_id);

  INSERT INTO db_properties (id, database_id, workspace_id, name, type, is_primary, is_system, position)
  VALUES (generate_ulid(), v_expenses_id, p_workspace_id, 'Description', 'title', TRUE, TRUE, 0);

  INSERT INTO db_properties (id, database_id, workspace_id, name, type, config, is_system, position)
  VALUES (generate_ulid(), v_expenses_id, p_workspace_id, 'Amount', 'number',
    '{"format":"currency_cents"}'::jsonb, TRUE, 1);

  INSERT INTO db_properties (id, database_id, workspace_id, name, type, config, is_system, position)
  VALUES (generate_ulid(), v_expenses_id, p_workspace_id, 'Category', 'select',
    '{"options":[{"id":"food","name":"Food","color":"orange"},{"id":"transport","name":"Transport","color":"blue"},{"id":"entertainment","name":"Entertainment","color":"purple"},{"id":"health","name":"Health","color":"green"},{"id":"other","name":"Other","color":"gray"}]}'::jsonb,
    TRUE, 2);

  INSERT INTO db_properties (id, database_id, workspace_id, name, type, config, is_system, position)
  VALUES (generate_ulid(), v_expenses_id, p_workspace_id, 'Date', 'date', '{}'::jsonb, TRUE, 3);

  INSERT INTO db_views (id, database_id, workspace_id, name, type, config, is_default, position)
  VALUES (generate_ulid(), v_expenses_id, p_workspace_id, 'Expenses', 'table',
    '{"rowHeight":"compact","sorts":[{"property":"Date","direction":"desc"}]}'::jsonb, TRUE, 0);

  -- ── NOTES ─────────────────────────────────────────────────
  INSERT INTO databases (id, workspace_id, title, is_system, created_by_user_id)
  VALUES (v_notes_id, p_workspace_id, 'Notes', TRUE, p_user_id);

  INSERT INTO db_properties (id, database_id, workspace_id, name, type, is_primary, is_system, position)
  VALUES (generate_ulid(), v_notes_id, p_workspace_id, 'Title', 'title', TRUE, TRUE, 0);

  INSERT INTO db_properties (id, database_id, workspace_id, name, type, config, is_system, position)
  VALUES (generate_ulid(), v_notes_id, p_workspace_id, 'Tags', 'multi_select', '{"options":[]}'::jsonb, TRUE, 1);

  INSERT INTO db_properties (id, database_id, workspace_id, name, type, config, is_system, position)
  VALUES (generate_ulid(), v_notes_id, p_workspace_id, 'Updated', 'updated_at', '{}'::jsonb, TRUE, 2);

  INSERT INTO db_views (id, database_id, workspace_id, name, type, config, is_default, position)
  VALUES (generate_ulid(), v_notes_id, p_workspace_id, 'All Notes', 'gallery',
    '{"rowHeight":"medium"}'::jsonb, TRUE, 0);

  -- ── GOALS ─────────────────────────────────────────────────
  INSERT INTO databases (id, workspace_id, title, is_system, created_by_user_id)
  VALUES (v_goals_id, p_workspace_id, 'Goals', TRUE, p_user_id);

  INSERT INTO db_properties (id, database_id, workspace_id, name, type, is_primary, is_system, position)
  VALUES (generate_ulid(), v_goals_id, p_workspace_id, 'Goal', 'title', TRUE, TRUE, 0);

  INSERT INTO db_properties (id, database_id, workspace_id, name, type, config, is_system, position)
  VALUES (generate_ulid(), v_goals_id, p_workspace_id, 'Status', 'status',
    '{"options":[{"id":"not_started","name":"Not Started","color":"gray","group":"todo"},{"id":"in_progress","name":"In Progress","color":"blue","group":"in_progress"},{"id":"completed","name":"Completed","color":"green","group":"done"}]}'::jsonb,
    TRUE, 1);

  INSERT INTO db_properties (id, database_id, workspace_id, name, type, config, is_system, position)
  VALUES (generate_ulid(), v_goals_id, p_workspace_id, 'Progress', 'number', '{"format":"number"}'::jsonb, TRUE, 2);

  INSERT INTO db_properties (id, database_id, workspace_id, name, type, config, is_system, position)
  VALUES (generate_ulid(), v_goals_id, p_workspace_id, 'Target Date', 'date', '{}'::jsonb, TRUE, 3);

  INSERT INTO db_views (id, database_id, workspace_id, name, type, config, is_default, position)
  VALUES (generate_ulid(), v_goals_id, p_workspace_id, 'Goals', 'board',
    '{"groupBy":"Status"}'::jsonb, TRUE, 0);

  -- ── PROJECTS ─────────────────────────────────────────────────
  INSERT INTO databases (id, workspace_id, title, is_system, created_by_user_id)
  VALUES (v_projects_id, p_workspace_id, 'Projects', TRUE, p_user_id);

  INSERT INTO db_properties (id, database_id, workspace_id, name, type, is_primary, is_system, position)
  VALUES (generate_ulid(), v_projects_id, p_workspace_id, 'Project', 'title', TRUE, TRUE, 0);

  INSERT INTO db_properties (id, database_id, workspace_id, name, type, config, is_system, position)
  VALUES (generate_ulid(), v_projects_id, p_workspace_id, 'Status', 'status',
    '{"options":[{"id":"planning","name":"Planning","color":"gray","group":"todo"},{"id":"active","name":"Active","color":"blue","group":"in_progress"},{"id":"completed","name":"Completed","color":"green","group":"done"},{"id":"on_hold","name":"On Hold","color":"yellow","group":"todo"}]}'::jsonb,
    TRUE, 1);

  INSERT INTO db_properties (id, database_id, workspace_id, name, type, config, is_system, position)
  VALUES (generate_ulid(), v_projects_id, p_workspace_id, 'Start Date', 'date', '{}'::jsonb, TRUE, 2);

  INSERT INTO db_properties (id, database_id, workspace_id, name, type, config, is_system, position)
  VALUES (generate_ulid(), v_projects_id, p_workspace_id, 'End Date', 'date', '{}'::jsonb, TRUE, 3);

  INSERT INTO db_properties (id, database_id, workspace_id, name, type, config, is_system, position)
  VALUES (generate_ulid(), v_projects_id, p_workspace_id, 'Team', 'person', '{}'::jsonb, TRUE, 4);

  INSERT INTO db_views (id, database_id, workspace_id, name, type, config, is_default, position)
  VALUES (generate_ulid(), v_projects_id, p_workspace_id, 'Projects', 'board',
    '{"groupBy":"Status"}'::jsonb, TRUE, 0);

  INSERT INTO db_views (id, database_id, workspace_id, name, type, config, position)
  VALUES (generate_ulid(), v_projects_id, p_workspace_id, 'Timeline', 'timeline',
    '{"startProp":"Start Date","endProp":"End Date"}'::jsonb, 1);

END $$;

GRANT EXECUTE ON FUNCTION seed_system_databases(TEXT, TEXT) TO app_user;

-- ============================================================
-- 0720: rls_pack_w07 — FORCE RLS sweep on all new tables
-- ============================================================

-- Verify FORCE RLS is set on all W07 tables
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['databases','db_properties','db_rows','db_views',
                            'db_relations','db_relation_values','db_audit_log',
                            'db_file_attachments','db_templates','db_csv_import_jobs']
  LOOP
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

COMMIT;
