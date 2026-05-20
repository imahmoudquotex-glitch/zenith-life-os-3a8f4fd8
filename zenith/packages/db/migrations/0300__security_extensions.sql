-- 0300__security_extensions.sql
-- Wave: W03
BEGIN;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE DOMAIN IF NOT EXISTS sha256_hash AS BYTEA CHECK (octet_length(VALUE) = 32);
COMMIT;
