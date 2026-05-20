/**
 * AI Quota — atomic reservation.
 * ADR-0004: 100 calls/day/user. Operational protection, not monetization.
 */
import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { env } from '@zenith/shared'

const DAILY_LIMIT = 100

export interface QuotaReservation {
  reservationId: string
  remainingAfter: number
}

function getServiceClient() {
  const e = env()
  return createClient(
    e.NEXT_PUBLIC_SUPABASE_URL,
    e.SUPABASE_SERVICE_ROLE_KEY || e.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export async function reserveAIQuota(
  userId: string,
  workspaceId: string,
  estimatedTokens: number,
): Promise<QuotaReservation> {
  const client = getServiceClient()
  const idempotencyKey = crypto.randomUUID()
  
  const { data, error } = await client.rpc('reserve_ai_usage', {
    p_workspace_id: workspaceId,
    p_user_id: userId,
    p_idempotency_key: idempotencyKey,
    p_estimated_tokens: estimatedTokens,
  })

  if (error) {
    throw new Error(`AI_QUOTA_EXCEEDED: ${error.message}`)
  }

  return {
    reservationId: data as string,
    remainingAfter: DAILY_LIMIT - 1, // RPC enforces hard token count in db
  }
}

export async function settleAIQuota(
  reservationId: string,
  actualTokens: number,
  status: 'success' | 'failed',
  provider?: string,
  model?: string,
  latencyMs?: number,
): Promise<void> {
  const client = getServiceClient()
  
  if (status === 'success') {
    const { error } = await client.rpc('settle_ai_usage', {
      p_reservation_id: reservationId,
      p_tokens_used: actualTokens,
      p_provider: provider || null,
      p_model: model || null,
      p_latency_ms: latencyMs || null,
    })
    if (error) {
      console.error('[settleAIQuota] Failed to settle AI quota:', error)
    }
  } else {
    const { error } = await client.rpc('refund_ai_usage', {
      p_reservation_id: reservationId,
    })
    if (error) {
      console.error('[settleAIQuota] Failed to refund AI quota:', error)
    }
  }
}

export async function refundAIQuota(reservationId: string): Promise<void> {
  await settleAIQuota(reservationId, 0, 'failed')
}
