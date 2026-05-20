-- File: 0205__ai_usage.sql
-- Wave: 03
-- Description: AI quota engine - atomic reservation, settlement, and refund RPCs
-- Author: Zenith Builder
-- Created: 2026-05-20
-- Idempotent: YES

BEGIN;

-- AI usage ledger (append-only)
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id              TEXT PRIMARY KEY,
  workspace_id    TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES public.users(id),
  day             DATE NOT NULL DEFAULT CURRENT_DATE,
  tokens_used     INT NOT NULL DEFAULT 0,
  calls_count     INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id, day)
);

CREATE INDEX idx_ai_usage_workspace_day ON public.ai_usage(workspace_id, day DESC);
CREATE INDEX idx_ai_usage_user_day ON public.ai_usage(user_id, day DESC);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage FORCE ROW LEVEL SECURITY;
CREATE POLICY ai_usage_workspace_isolation ON public.ai_usage
  USING (workspace_id = current_setting('app.current_workspace_id', true));
GRANT SELECT, INSERT, UPDATE ON public.ai_usage TO app_user;

-- AI usage events (each reservation/settlement/refund)
CREATE TABLE IF NOT EXISTS public.ai_usage_events (
  id                TEXT PRIMARY KEY,
  reservation_id    TEXT NOT NULL,
  workspace_id      TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id           TEXT NOT NULL REFERENCES public.users(id),
  idempotency_key   TEXT NOT NULL,
  tokens_reserved   INT NOT NULL DEFAULT 0,
  tokens_used       INT,
  tokens_refunded   INT NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'reserved'
                      CHECK (status IN ('reserved','settled','refunded','failed')),
  provider          TEXT,
  model             TEXT,
  latency_ms        INT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  settled_at        TIMESTAMPTZ,
  UNIQUE (workspace_id, idempotency_key)
);

CREATE INDEX idx_ai_usage_events_workspace ON public.ai_usage_events(workspace_id, created_at DESC);
CREATE INDEX idx_ai_usage_events_reservation ON public.ai_usage_events(reservation_id);

ALTER TABLE public.ai_usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_events FORCE ROW LEVEL SECURITY;
CREATE POLICY ai_usage_events_isolation ON public.ai_usage_events
  USING (workspace_id = current_setting('app.current_workspace_id', true));
GRANT SELECT, INSERT, UPDATE ON public.ai_usage_events TO app_user;

-- RPC: reserve_ai_usage (atomic, idempotent, race-free)
CREATE OR REPLACE FUNCTION public.reserve_ai_usage(
  p_workspace_id    TEXT,
  p_user_id         TEXT,
  p_idempotency_key TEXT,
  p_estimated_tokens INT
) RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
  v_reservation_id TEXT;
  v_daily_used     INT;
  v_daily_limit    INT := 100000; -- 100k tokens/day/workspace (operational limit)
BEGIN
  -- Idempotency: return existing reservation if same key
  SELECT reservation_id INTO v_reservation_id
  FROM public.ai_usage_events
  WHERE workspace_id = p_workspace_id AND idempotency_key = p_idempotency_key;
  
  IF FOUND THEN RETURN v_reservation_id; END IF;

  -- Check daily quota (lock to prevent race condition)
  SELECT COALESCE(SUM(tokens_reserved - tokens_refunded - COALESCE(tokens_used, 0)), 0)
  INTO v_daily_used
  FROM public.ai_usage_events
  WHERE workspace_id = p_workspace_id
    AND created_at >= date_trunc('day', now() AT TIME ZONE 'UTC')
  FOR UPDATE;

  IF v_daily_used + p_estimated_tokens > v_daily_limit THEN
    RAISE EXCEPTION 'AI_QUOTA_EXCEEDED';
  END IF;

  -- Create reservation
  v_reservation_id := public.generate_ulid();
  INSERT INTO public.ai_usage_events(
    id, reservation_id, workspace_id, user_id,
    idempotency_key, tokens_reserved, status, created_at
  ) VALUES (
    public.generate_ulid(), v_reservation_id, p_workspace_id, p_user_id,
    p_idempotency_key, p_estimated_tokens, 'reserved', now()
  );

  RETURN v_reservation_id;
END $$;

-- RPC: settle_ai_usage
CREATE OR REPLACE FUNCTION public.settle_ai_usage(
  p_reservation_id TEXT,
  p_tokens_used    INT,
  p_provider       TEXT DEFAULT NULL,
  p_model          TEXT DEFAULT NULL,
  p_latency_ms     INT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
BEGIN
  UPDATE public.ai_usage_events
  SET status = 'settled',
      tokens_used = p_tokens_used,
      provider = p_provider,
      model = p_model,
      latency_ms = p_latency_ms,
      settled_at = now()
  WHERE reservation_id = p_reservation_id AND status = 'reserved';
END $$;

-- RPC: refund_ai_usage
CREATE OR REPLACE FUNCTION public.refund_ai_usage(
  p_reservation_id TEXT
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
BEGIN
  UPDATE public.ai_usage_events
  SET status = 'refunded',
      tokens_refunded = tokens_reserved,
      settled_at = now()
  WHERE reservation_id = p_reservation_id AND status = 'reserved';
END $$;

COMMIT;
