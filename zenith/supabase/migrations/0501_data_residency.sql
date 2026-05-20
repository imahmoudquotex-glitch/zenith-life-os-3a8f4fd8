-- File: 0018__data_residency.sql
-- Wave: 01
-- Description: Data residency column for multi-region (W31)
-- Author: Zenith
-- Created: 2026-05-16
-- Idempotent: YES
-- Rollback: forward-fix only

BEGIN;

ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS data_region CHAR(8) NOT NULL DEFAULT 'eu-west-1';

ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS data_residency_locked BOOLEAN NOT NULL DEFAULT false;

COMMIT;
