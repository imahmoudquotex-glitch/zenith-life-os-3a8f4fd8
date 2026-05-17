-- Migration: 0041_audit_events_definer.sql
-- Wave 03: Audit events SECURITY DEFINER function
-- Ensures audit log writes bypass RLS (service-level privilege)

-- SECURITY DEFINER function for writing audit events
-- This allows the application to write audit logs even when
-- the current user doesn't have direct INSERT on audit tables.

CREATE OR REPLACE FUNCTION public.write_audit_event(
  p_workspace_id TEXT,
  p_actor_id TEXT,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id TEXT,
  p_metadata JSONB DEFAULT '{}'::JSONB
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id TEXT;
BEGIN
  -- Validate ULID format
  IF NOT public.is_ulid(p_workspace_id) THEN
    RAISE EXCEPTION 'Invalid workspace_id ULID format';
  END IF;

  IF NOT public.is_ulid(p_actor_id) THEN
    RAISE EXCEPTION 'Invalid actor_id ULID format';
  END IF;

  -- Generate event ID
  SELECT public.generate_ulid() INTO v_event_id;

  INSERT INTO public.audit_events (
    id,
    workspace_id,
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata,
    created_at
  ) VALUES (
    v_event_id,
    p_workspace_id,
    p_actor_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_metadata,
    NOW()
  );

  RETURN v_event_id;
END;
$$;

-- Revoke direct INSERT from authenticated users
-- Only the SECURITY DEFINER function can write audit events
REVOKE INSERT ON public.audit_events FROM authenticated;
GRANT EXECUTE ON FUNCTION public.write_audit_event TO authenticated;

COMMENT ON FUNCTION public.write_audit_event IS
  'SECURITY DEFINER: Write audit events bypassing RLS. Only callable by authenticated users via function.';
