-- File: 0108__audit_events_w02_actions_seed.sql
-- Wave: 02
-- Description: Validate Wave 02 audit action names
-- Author: Zenith Builder
-- Created: 2026-05-16
-- Idempotent: YES

BEGIN;

-- Validation function for Wave 02 audit actions
CREATE OR REPLACE FUNCTION public.is_valid_w02_audit_action(action TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT action IN (
    'user.profile.updated',
    'workspace.created',
    'workspace.updated',
    'workspace.archived',
    'workspace.restored',
    'workspace.ownership_transferred',
    'workspace.member.invited',
    'workspace.member.invitation_revoked',
    'workspace.member.joined',
    'workspace.member.invitation_declined',
    'workspace.member.role_changed',
    'workspace.member.removed',
    'page.created',
    'page.updated',
    'page.moved',
    'page.archived',
    'page.restored',
    'page.deleted',
    'page.permission_added',
    'page.permission_changed',
    'page.permission_removed'
  );
$$;

COMMENT ON FUNCTION public.is_valid_w02_audit_action(TEXT) IS 'Validates Wave 02 audit action names';

COMMIT;
