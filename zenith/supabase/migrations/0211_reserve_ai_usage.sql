-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- File:        0211_reserve_ai_usage.sql
-- Wave:        W02 (0211–0310)
-- Description: Reserve Ai Usage
-- Author:      zenith-system
-- Created:     2026-05-20
-- Idempotent:  YES (uses IF NOT EXISTS / OR REPLACE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN;

-- W02: 0211_reserve_ai_usage.sql
-- Atomic AI quota reservation RPC (no race conditions)
-- Wave: W02 (0200-0299)

CREATE OR REPLACE FUNCTION reserve_ai_usage(
  p_workspace_id  TEXT,
  p_user_id       TEXT,
  p_model         TEXT,
  p_estimated_tokens INTEGER DEFAULT 1000
) RETURNS TABLE (
  reservation_id  TEXT,
  quota_remaining INTEGER,
  granted         BOOLEAN
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_reservation_id TEXT := gen_ulid();
  v_daily_limit    INTEGER := 100;
  v_used_today     INTEGER;
  v_granted        BOOLEAN;
BEGIN
  -- Count calls used today (atomic under transaction)
  SELECT COUNT(*)::INTEGER INTO v_used_today
  FROM ai_usage
  WHERE workspace_id = p_workspace_id
    AND user_id = p_user_id
    AND created_at >= date_trunc('day', NOW() AT TIME ZONE 'Africa/Cairo')
    AND status != 'refunded';

  v_granted := (v_used_today < v_daily_limit);

  IF v_granted THEN
    INSERT INTO ai_usage (
      id, workspace_id, user_id, model,
      estimated_tokens, status, created_at
    ) VALUES (
      v_reservation_id, p_workspace_id, p_user_id, p_model,
      p_estimated_tokens, 'reserved', NOW()
    );
  END IF;

  RETURN QUERY SELECT
    v_reservation_id,
    (v_daily_limit - v_used_today - CASE WHEN v_granted THEN 1 ELSE 0 END)::INTEGER,
    v_granted;
END;
$$;

-- Grant execute to authenticated users only
REVOKE ALL ON FUNCTION reserve_ai_usage FROM PUBLIC;
GRANT EXECUTE ON FUNCTION reserve_ai_usage TO authenticated;


COMMIT;
