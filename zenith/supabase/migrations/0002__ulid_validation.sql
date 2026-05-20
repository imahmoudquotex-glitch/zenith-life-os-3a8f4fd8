-- File: 0002__ulid_validation.sql
-- Wave: 01
-- Description: ULID validation function for CHECK constraints
-- Author: Zenith Builder
-- Created: 2026-05-16
-- Idempotent: YES

BEGIN;

CREATE OR REPLACE FUNCTION public.is_ulid(val TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT val ~ '^[0-9A-HJKMNP-TV-Z]{26}$';
$$;

COMMENT ON FUNCTION public.is_ulid IS 'Validates a TEXT value as a valid ULID (Crockford Base32, 26 chars)';

COMMIT;
