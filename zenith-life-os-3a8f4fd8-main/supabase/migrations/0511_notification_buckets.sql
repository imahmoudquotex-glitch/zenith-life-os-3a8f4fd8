-- =============================================================================
-- Migration 0511 — Notification Buckets (Phase 07 — Rate Limit)
-- FIXED: UUID → TEXT, auth.uid() → current_user_id()
-- =============================================================================
-- القواعد:
-- - Max 5 إشعارات/ساعة لكل (user_id, type)
-- - يمنع spam الإشعارات
-- - RLS مفعّل
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.notification_buckets (
  user_id     TEXT        NOT NULL,
  type        TEXT        NOT NULL,
  hour_bucket TIMESTAMPTZ NOT NULL,
  count       INT         NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, type, hour_bucket)
);

ALTER TABLE public.notification_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_buckets FORCE ROW LEVEL SECURITY;

CREATE POLICY notif_buckets_isolation ON public.notification_buckets
  USING (user_id = public.current_user_id());

-- Function: increment or insert bucket count
CREATE OR REPLACE FUNCTION public.increment_notification_bucket(
  p_user TEXT,
  p_type TEXT,
  p_hour TIMESTAMPTZ
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
BEGIN
  INSERT INTO public.notification_buckets(user_id, type, hour_bucket, count)
  VALUES (p_user, p_type, p_hour, 1)
  ON CONFLICT (user_id, type, hour_bucket)
  DO UPDATE SET count = notification_buckets.count + 1;
END $$;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_notif_buckets_user_type_hour
  ON public.notification_buckets(user_id, type, hour_bucket);

-- Auto-cleanup: حذف buckets أقدم من 24 ساعة (optional cleanup)
-- يمكن تشغيلها عبر pg_cron لاحقاً

COMMIT;
