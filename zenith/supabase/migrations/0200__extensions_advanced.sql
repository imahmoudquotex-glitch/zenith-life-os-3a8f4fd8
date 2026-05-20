-- 0200__extensions_advanced.sql
-- Wave: W02
-- Purpose: Advanced PostgreSQL extensions needed for full-text search, crypto, and text processing

BEGIN;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
COMMIT;
