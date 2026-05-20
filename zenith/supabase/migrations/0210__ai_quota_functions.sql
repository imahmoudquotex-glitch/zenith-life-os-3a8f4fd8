-- 0210__ai_quota_functions.sql
-- Wave: W02
-- Purpose: Atomic AI quota RPCs — reserve/complete/refund with idempotency and plan-based limits
-- CRITICAL: All AI requests MUST go through reserve_ai_usage → complete_ai_usage or refund_ai_usage

BEGIN;
CREATE OR REPLACE FUNCTION public.reserve_ai_usage(
  p_user TEXT, p_workspace TEXT, p_kind TEXT, p_mode TEXT,
  p_request_id TEXT, p_provider TEXT DEFAULT NULL, p_model TEXT DEFAULT NULL
) RETURNS TABLE(allowed BOOLEAN, used INT, remaining INT, day_local DATE)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_day DATE;
  v_count INT;
  v_limit INT;
  v_plan TEXT;
BEGIN
  IF p_user IS NULL OR p_user <> current_user_id() THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  IF p_request_id IS NULL OR length(p_request_id) < 12 THEN
    RAISE EXCEPTION 'request_id_required';
  END IF;

  -- Plan-based daily limits (ADR-0040)
  SELECT COALESCE(plan, 'free') INTO v_plan FROM users WHERE id = p_user;
  v_limit := CASE v_plan
    WHEN 'free'       THEN 3
    WHEN 'pro'        THEN 100
    WHEN 'team'       THEN 500
    WHEN 'enterprise' THEN 2000
    ELSE 3
  END;

  v_day := local_day(p_user);

  INSERT INTO ai_usage(user_id, day_local, count)
  VALUES (p_user, v_day, 0)
  ON CONFLICT (user_id, day_local) DO NOTHING;

  SELECT count INTO v_count FROM ai_usage
  WHERE user_id = p_user AND day_local = v_day
  FOR UPDATE;

  IF v_count >= v_limit THEN
    RETURN QUERY SELECT FALSE, v_count, 0, v_day;
    RETURN;
  END IF;

  INSERT INTO ai_usage_events(
    id, user_id, workspace_id, day_local, kind, mode,
    request_id, status, provider, model
  )
  VALUES (
    encode(gen_random_bytes(13), 'hex'),
    p_user, p_workspace, v_day, p_kind, p_mode,
    p_request_id, 'reserved', p_provider, p_model
  )
  ON CONFLICT (user_id, request_id) DO NOTHING;

  IF NOT FOUND THEN
    -- Same request_id already reserved — idempotent return
    SELECT count INTO v_count FROM ai_usage
    WHERE user_id = p_user AND day_local = v_day;
    RETURN QUERY SELECT TRUE, v_count, GREATEST(v_limit - v_count, 0), v_day;
    RETURN;
  END IF;

  UPDATE ai_usage
  SET count = count + 1, last_kind = p_kind, last_used_at = now()
  WHERE user_id = p_user AND day_local = v_day
  RETURNING count INTO v_count;

  RETURN QUERY SELECT TRUE, v_count, GREATEST(v_limit - v_count, 0), v_day;
END $$;

CREATE OR REPLACE FUNCTION public.complete_ai_usage(
  p_user TEXT, p_request_id TEXT,
  p_input_tokens INT DEFAULT NULL,
  p_output_tokens INT DEFAULT NULL,
  p_cost_cents BIGINT DEFAULT NULL
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  UPDATE ai_usage_events
  SET
    status = 'completed',
    completed_at = now(),
    input_tokens = p_input_tokens,
    output_tokens = p_output_tokens,
    cost_cents = p_cost_cents
  WHERE user_id = p_user
    AND request_id = p_request_id
    AND status = 'reserved';
END $$;

CREATE OR REPLACE FUNCTION public.refund_ai_usage(
  p_user TEXT, p_request_id TEXT, p_error_code TEXT DEFAULT NULL
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_day DATE;
BEGIN
  UPDATE ai_usage_events
  SET status = 'refunded', error_code = p_error_code, completed_at = now()
  WHERE user_id = p_user
    AND request_id = p_request_id
    AND status = 'reserved'
  RETURNING day_local INTO v_day;

  IF FOUND THEN
    UPDATE ai_usage
    SET count = GREATEST(count - 1, 0)
    WHERE user_id = p_user AND day_local = v_day;
  END IF;
END $$;
COMMIT;
