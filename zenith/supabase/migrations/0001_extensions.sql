-- File: 0001__extensions.sql
-- Wave: 01
-- Description: Enable required PostgreSQL extensions
-- Author: Zenith Builder
-- Created: 2026-05-16
-- Idempotent: YES

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

COMMIT;
