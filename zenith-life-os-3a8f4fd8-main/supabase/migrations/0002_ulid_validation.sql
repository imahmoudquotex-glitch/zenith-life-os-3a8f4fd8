-- Migration 0002: ULID validation function
-- Reviewer issue #10: All business IDs = ULID TEXT
BEGIN;

CREATE OR REPLACE FUNCTION public.is_ulid(value TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT value ~ '^[0-9A-HJKMNP-TV-Z]{26}$';
$$;

COMMENT ON FUNCTION public.is_ulid IS 'Validates Crockford Base32 ULID format (26 chars)';

COMMIT;
