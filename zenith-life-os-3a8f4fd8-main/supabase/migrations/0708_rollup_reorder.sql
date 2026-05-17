BEGIN;

-- ============================================================
-- 0708: compute_rollup RPC (count/sum/avg/min/max/percent_checked/percent_empty/earliest/latest)
-- ============================================================
CREATE OR REPLACE FUNCTION compute_rollup(
  p_property_id        TEXT,
  p_source_row_id      TEXT,
  p_target_property_name TEXT,
  p_agg                TEXT
) RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
  v_result  NUMERIC;
  v_count   INT;
  v_text    TEXT;
BEGIN
  -- Validate workspace isolation
  IF NOT EXISTS (
    SELECT 1 FROM db_properties dp
    JOIN databases d ON d.id = dp.database_id
    WHERE dp.id = p_property_id AND d.workspace_id = current_workspace_id()
  ) THEN
    RAISE EXCEPTION 'access_denied';
  END IF;

  CASE p_agg
    WHEN 'count' THEN
      SELECT COUNT(*) INTO v_count
      FROM db_relation_values rv
      WHERE rv.property_id = p_property_id AND rv.source_row_id = p_source_row_id;
      RETURN jsonb_build_object('value', v_count, 'agg', 'count');

    WHEN 'percent_checked' THEN
      SELECT ROUND(
        100.0 * COUNT(*) FILTER (WHERE (r.properties->>p_target_property_name)::BOOLEAN)
        / NULLIF(COUNT(*), 0), 1
      ) INTO v_result
      FROM db_relation_values rv
      JOIN db_rows r ON r.id = rv.target_row_id
      WHERE rv.property_id = p_property_id AND rv.source_row_id = p_source_row_id
        AND NOT r.is_deleted;
      RETURN jsonb_build_object('value', COALESCE(v_result, 0), 'agg', 'percent_checked');

    WHEN 'percent_empty' THEN
      SELECT ROUND(
        100.0 * COUNT(*) FILTER (WHERE (r.properties->>p_target_property_name) IS NULL
                                    OR (r.properties->>p_target_property_name) = '')
        / NULLIF(COUNT(*), 0), 1
      ) INTO v_result
      FROM db_relation_values rv
      JOIN db_rows r ON r.id = rv.target_row_id
      WHERE rv.property_id = p_property_id AND rv.source_row_id = p_source_row_id
        AND NOT r.is_deleted;
      RETURN jsonb_build_object('value', COALESCE(v_result, 0), 'agg', 'percent_empty');

    WHEN 'earliest' THEN
      SELECT MIN((r.properties->>p_target_property_name)::TIMESTAMPTZ) INTO v_text
      FROM db_relation_values rv
      JOIN db_rows r ON r.id = rv.target_row_id
      WHERE rv.property_id = p_property_id AND rv.source_row_id = p_source_row_id
        AND NOT r.is_deleted;
      RETURN jsonb_build_object('value', v_text, 'agg', 'earliest');

    WHEN 'latest' THEN
      SELECT MAX((r.properties->>p_target_property_name)::TIMESTAMPTZ) INTO v_text
      FROM db_relation_values rv
      JOIN db_rows r ON r.id = rv.target_row_id
      WHERE rv.property_id = p_property_id AND rv.source_row_id = p_source_row_id
        AND NOT r.is_deleted;
      RETURN jsonb_build_object('value', v_text, 'agg', 'latest');

    WHEN 'sum', 'avg', 'min', 'max' THEN
      EXECUTE format(
        'SELECT %s((r.properties->>%L)::NUMERIC)
         FROM db_relation_values rv
         JOIN db_rows r ON r.id = rv.target_row_id
         WHERE rv.property_id = %L AND rv.source_row_id = %L AND NOT r.is_deleted',
        p_agg, p_target_property_name, p_property_id, p_source_row_id
      ) INTO v_result;
      RETURN jsonb_build_object('value', v_result, 'agg', p_agg);

    ELSE
      RAISE EXCEPTION 'unsupported_aggregation: %', p_agg;
  END CASE;
END $$;

GRANT EXECUTE ON FUNCTION compute_rollup(TEXT, TEXT, TEXT, TEXT) TO app_user;

-- ============================================================
-- 0709: reorder_row RPC (atomic fractional + renormalize)
-- ============================================================
CREATE OR REPLACE FUNCTION reorder_row(
  p_row_id      TEXT,
  p_prev_pos    DOUBLE PRECISION,
  p_next_pos    DOUBLE PRECISION
) RETURNS DOUBLE PRECISION LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
  v_new_pos  DOUBLE PRECISION;
  v_db_id    TEXT;
  v_count    INT;
BEGIN
  SELECT database_id INTO v_db_id FROM db_rows WHERE id = p_row_id AND workspace_id = current_workspace_id();
  IF NOT FOUND THEN RAISE EXCEPTION 'row_not_found'; END IF;

  IF p_prev_pos IS NULL AND p_next_pos IS NULL THEN
    v_new_pos := 1000;
  ELSIF p_prev_pos IS NULL THEN
    v_new_pos := p_next_pos / 2.0;
  ELSIF p_next_pos IS NULL THEN
    v_new_pos := p_prev_pos + 1000;
  ELSE
    v_new_pos := (p_prev_pos + p_next_pos) / 2.0;
  END IF;

  -- Renormalize if positions too close
  SELECT COUNT(*) INTO v_count FROM db_rows
  WHERE database_id = v_db_id AND NOT is_deleted
    AND position BETWEEN v_new_pos - 0.001 AND v_new_pos + 0.001;

  IF v_count > 0 THEN
    WITH ranked AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY position, created_at) * 1000.0 AS new_pos
      FROM db_rows WHERE database_id = v_db_id AND NOT is_deleted
    )
    UPDATE db_rows SET position = ranked.new_pos
    FROM ranked WHERE db_rows.id = ranked.id;

    SELECT position + 500 INTO v_new_pos FROM db_rows
    WHERE id = p_row_id;
  END IF;

  UPDATE db_rows SET position = v_new_pos WHERE id = p_row_id AND workspace_id = current_workspace_id();
  RETURN v_new_pos;
END $$;

GRANT EXECUTE ON FUNCTION reorder_row(TEXT, DOUBLE PRECISION, DOUBLE PRECISION) TO app_user;

COMMIT;
