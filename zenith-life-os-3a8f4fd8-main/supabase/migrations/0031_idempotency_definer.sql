-- Migration: 0031_idempotency_definer.sql
-- Wave 03: Idempotency SECURITY DEFINER function
-- Ensures idempotency checks bypass RLS for cross-workspace reliability

CREATE OR REPLACE FUNCTION public.check_idempotency(
  p_key TEXT,
  p_workspace_id TEXT,
  p_ttl_seconds INTEGER DEFAULT 86400
) RETURNS TABLE(
  is_duplicate BOOLEAN,
  existing_response JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing RECORD;
BEGIN
  -- Try to find existing key
  SELECT response_body, created_at
  INTO v_existing
  FROM public.api_idempotency_keys
  WHERE idempotency_key = p_key
    AND workspace_id = p_workspace_id
    AND created_at > (NOW() - (p_ttl_seconds || ' seconds')::INTERVAL);

  IF FOUND THEN
    RETURN QUERY SELECT TRUE, v_existing.response_body;
  ELSE
    -- Insert new key (will fail on duplicate due to unique constraint)
    BEGIN
      INSERT INTO public.api_idempotency_keys (
        id,
        idempotency_key,
        workspace_id,
        created_at
      ) VALUES (
        public.generate_ulid(),
        p_key,
        p_workspace_id,
        NOW()
      );
    EXCEPTION WHEN unique_violation THEN
      -- Race condition: another request claimed the key
      SELECT response_body INTO v_existing
      FROM public.api_idempotency_keys
      WHERE idempotency_key = p_key AND workspace_id = p_workspace_id;

      IF FOUND THEN
        RETURN QUERY SELECT TRUE, v_existing.response_body;
        RETURN;
      END IF;
    END;

    RETURN QUERY SELECT FALSE, NULL::JSONB;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_idempotency TO authenticated;

COMMENT ON FUNCTION public.check_idempotency IS
  'SECURITY DEFINER: Idempotency key check/claim with race condition handling.';
