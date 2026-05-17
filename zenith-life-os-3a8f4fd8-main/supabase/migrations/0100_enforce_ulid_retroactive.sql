-- Migration 0100: Add ULID checks to all W06/W07 tables
-- This adds missing is_ulid() CHECK constraints that were not in original migrations
BEGIN;

-- Add ULID checks to tables missing them
ALTER TABLE IF EXISTS public.databases
  ADD CONSTRAINT IF NOT EXISTS chk_databases_ulid CHECK (public.is_ulid(id));

ALTER TABLE IF EXISTS public.db_properties
  ADD CONSTRAINT IF NOT EXISTS chk_db_properties_ulid CHECK (public.is_ulid(id));

ALTER TABLE IF EXISTS public.db_rows
  ADD CONSTRAINT IF NOT EXISTS chk_db_rows_ulid CHECK (public.is_ulid(id));

ALTER TABLE IF EXISTS public.db_views
  ADD CONSTRAINT IF NOT EXISTS chk_db_views_ulid CHECK (public.is_ulid(id));

ALTER TABLE IF EXISTS public.db_relations
  ADD CONSTRAINT IF NOT EXISTS chk_db_relations_ulid CHECK (public.is_ulid(id));

ALTER TABLE IF EXISTS public.db_relation_values
  ADD CONSTRAINT IF NOT EXISTS chk_db_relation_values_ulid CHECK (public.is_ulid(id));

COMMIT;
