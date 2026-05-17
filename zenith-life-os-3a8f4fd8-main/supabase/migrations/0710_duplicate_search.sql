BEGIN;

-- ============================================================
-- 0710: duplicate_database RPC (copy with properties + views + rows)
-- ============================================================
CREATE OR REPLACE FUNCTION duplicate_database(
  p_source_db_id TEXT,
  p_new_title    TEXT DEFAULT NULL,
  p_copy_rows    BOOLEAN DEFAULT FALSE
) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
  v_new_db_id    TEXT;
  v_ws_id        TEXT;
  v_new_title    TEXT;
  v_prop         RECORD;
  v_view         RECORD;
  v_prop_id_map  JSONB := '{}'::jsonb;
  v_new_prop_id  TEXT;
BEGIN
  -- Verify access
  SELECT workspace_id, title INTO v_ws_id, v_new_title
  FROM databases WHERE id = p_source_db_id AND workspace_id = current_workspace_id() AND NOT is_deleted;
  IF NOT FOUND THEN RAISE EXCEPTION 'database_not_found'; END IF;

  v_new_db_id := generate_ulid();
  v_new_title := COALESCE(p_new_title, v_new_title || ' (Copy)');

  -- Copy database
  INSERT INTO databases (id, workspace_id, title, icon_kind, icon_value, cover_url, description,
                         is_system, created_by_user_id)
  SELECT v_new_db_id, workspace_id, v_new_title, icon_kind, icon_value, cover_url, description,
         FALSE, current_user_id()
  FROM databases WHERE id = p_source_db_id;

  -- Copy properties
  FOR v_prop IN SELECT * FROM db_properties WHERE database_id = p_source_db_id ORDER BY position LOOP
    v_new_prop_id := generate_ulid();
    v_prop_id_map := v_prop_id_map || jsonb_build_object(v_prop.id, v_new_prop_id);
    INSERT INTO db_properties (id, database_id, workspace_id, name, type, config, position, is_primary, is_hidden, is_system)
    VALUES (v_new_prop_id, v_new_db_id, v_ws_id, v_prop.name, v_prop.type, v_prop.config,
            v_prop.position, v_prop.is_primary, v_prop.is_hidden, v_prop.is_system);
  END LOOP;

  -- Copy views (update hidden prop refs)
  FOR v_view IN SELECT * FROM db_views WHERE database_id = p_source_db_id ORDER BY position LOOP
    INSERT INTO db_views (id, database_id, workspace_id, name, type, config, is_default, position)
    VALUES (generate_ulid(), v_new_db_id, v_ws_id, v_view.name, v_view.type,
            v_view.config, v_view.is_default, v_view.position);
  END LOOP;

  -- Copy rows if requested
  IF p_copy_rows THEN
    INSERT INTO db_rows (id, database_id, workspace_id, properties, position,
                         created_by_user_id, last_edited_by_user_id)
    SELECT generate_ulid(), v_new_db_id, v_ws_id, properties, position,
           current_user_id(), current_user_id()
    FROM db_rows WHERE database_id = p_source_db_id AND NOT is_deleted;
  END IF;

  RETURN v_new_db_id;
END $$;

GRANT EXECUTE ON FUNCTION duplicate_database(TEXT, TEXT, BOOLEAN) TO app_user;

-- ============================================================
-- 0711: db_search_tsv (tsvector on title property)
-- ============================================================
ALTER TABLE db_rows ADD COLUMN IF NOT EXISTS search_tsv TSVECTOR;

CREATE OR REPLACE FUNCTION db_rows_update_tsv() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_tsv := to_tsvector('simple',
    COALESCE(NEW.properties->>'title', '') || ' ' ||
    COALESCE(NEW.properties->>'name', '') || ' ' ||
    COALESCE(NEW.properties->>'text', '')
  );
  RETURN NEW;
END $$;

CREATE OR REPLACE TRIGGER trg_db_rows_tsv
  BEFORE INSERT OR UPDATE OF properties ON db_rows
  FOR EACH ROW EXECUTE FUNCTION db_rows_update_tsv();

CREATE INDEX IF NOT EXISTS idx_db_rows_search_tsv ON db_rows USING GIN(search_tsv);

COMMIT;
