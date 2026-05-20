BEGIN;
CREATE OR REPLACE FUNCTION reserve_ai_usage(
  p_workspace_id TEXT,
  p_user_id TEXT,
  p_idempotency_key TEXT,
  p_estimated_tokens INT
) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_reservation_id TEXT := generate_ulid();
DECLARE v_used INT;
BEGIN
  PERFORM 1 FROM ai_usage_events
  WHERE workspace_id = p_workspace_id AND idempotency_key = p_idempotency_key
  FOR UPDATE;
  IF FOUND THEN
    SELECT reservation_id INTO v_reservation_id FROM ai_usage_events
    WHERE workspace_id = p_workspace_id AND idempotency_key = p_idempotency_key;
    RETURN v_reservation_id;
  END IF;

  SELECT COALESCE(SUM(tokens_reserved - tokens_refunded), 0)
  INTO v_used
  FROM ai_usage_events
  WHERE workspace_id = p_workspace_id
    AND created_at >= date_trunc('day', now());

  IF v_used + p_estimated_tokens > 1000000 THEN
    RAISE EXCEPTION 'AI_QUOTA_EXCEEDED';
  END IF;

  INSERT INTO ai_usage_events(id, reservation_id, workspace_id, user_id, idempotency_key, tokens_reserved)
  VALUES (generate_ulid(), v_reservation_id, p_workspace_id, p_user_id, p_idempotency_key, p_estimated_tokens);
  RETURN v_reservation_id;
END $$;
COMMIT;