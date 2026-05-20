-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- File:        0200__extensions_advanced.sql
-- Wave:        W02 (0200–0299)
-- Description:  Extensions Advanced
-- Author:      zenith-system
-- Created:     2026-05-20
-- Idempotent:  YES (uses IF NOT EXISTS / OR REPLACE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN;

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
