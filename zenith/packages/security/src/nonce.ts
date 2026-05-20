// packages/security/src/nonce.ts
// Wave: W03 — Webhook nonce anti-replay using webhook_nonces table

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Maximum age of a valid nonce (5 minutes in seconds).
 * Webhooks older than this are rejected regardless.
 */
const MAX_AGE_SECONDS = 5 * 60;

/**
 * Assert that a webhook nonce is fresh (within 5 min) and has never been seen before.
 * Throws if the nonce is expired or already consumed.
 * Stores consumed nonces in webhook_nonces table (cleaned up by DB job).
 */
export async function assertNonceFresh(
  supabase: SupabaseClient,
  nonce: string,
  webhookTimestampSeconds: number,
): Promise<void> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const age = nowSeconds - webhookTimestampSeconds;

  if (age > MAX_AGE_SECONDS || age < -30) {
    throw new Error('WEBHOOK_TIMESTAMP_EXPIRED');
  }

  // Check if nonce already consumed (anti-replay)
  const { data: existing } = await supabase
    .from('webhook_nonces')
    .select('id')
    .eq('id', nonce)
    .maybeSingle();

  if (existing) {
    throw new Error('WEBHOOK_NONCE_REPLAYED');
  }

  // Mark nonce as consumed
  const { error } = await supabase
    .from('webhook_nonces')
    .insert({
      id: nonce,
      consumed_at: new Date().toISOString(),
      expires_at: new Date((webhookTimestampSeconds + MAX_AGE_SECONDS) * 1000).toISOString(),
    });

  if (error) {
    // If duplicate key — nonce race condition (parallel request)
    throw new Error('WEBHOOK_NONCE_CONFLICT');
  }
}
