// packages/security/src/webhook-verifier.ts
// Wave: W03 — Complete webhook signature + timestamp + anti-replay verification

import crypto from 'node:crypto';

/**
 * Verify a Stripe-style webhook signature.
 * Format: `t=<timestamp>,v1=<signature>`
 *
 * Validates:
 * 1. Signature matches HMAC-SHA256(secret, `${timestamp}.${payload}`)
 * 2. Timestamp is within ±5 minutes (replay protection)
 * 3. Uses timingSafeEqual to prevent timing attacks
 */
export function verifyWebhookSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
): { valid: boolean; timestampSeconds: number; nonce: string } {
  // Parse Stripe-style: "t=1234567890,v1=abc123,v1=def456"
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((p) => {
      const [k, ...rest] = p.split('=');
      return [k!.trim(), rest.join('=')];
    }),
  );

  const timestampStr = parts['t'];
  const signatures = signatureHeader
    .split(',')
    .filter((p) => p.trim().startsWith('v1='))
    .map((p) => p.replace('v1=', '').trim());

  if (!timestampStr || signatures.length === 0) {
    return { valid: false, timestampSeconds: 0, nonce: '' };
  }

  const timestampSeconds = parseInt(timestampStr, 10);
  if (isNaN(timestampSeconds)) {
    return { valid: false, timestampSeconds: 0, nonce: '' };
  }

  // Reject expired/future timestamps (±5 minutes)
  const nowSeconds = Math.floor(Date.now() / 1000);
  const age = nowSeconds - timestampSeconds;
  if (age > 300 || age < -30) {
    return { valid: false, timestampSeconds, nonce: '' };
  }

  // Compute expected signature
  const signedPayload = `${timestampStr}.${payload}`;
  const expectedHex = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  // Check any of the provided signatures match (Stripe rotates keys)
  let valid = false;
  for (const sig of signatures) {
    try {
      valid = crypto.timingSafeEqual(
        Buffer.from(sig, 'hex'),
        Buffer.from(expectedHex, 'hex'),
      );
      if (valid) break;
    } catch {
      // Buffer size mismatch — signature is invalid
    }
  }

  // Nonce = `${timestamp}:${payload hash}` — used with assertNonceFresh
  const nonce = `${timestampStr}:${crypto.createHash('sha256').update(payload).digest('hex').slice(0, 16)}`;

  return { valid, timestampSeconds, nonce };
}

/**
 * Simple binary signature verifier (for non-Stripe webhooks).
 * Uses raw HMAC-SHA256 with timingSafeEqual.
 */
export function verifySimpleHmacSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');

  const providedSig = signature.startsWith('sha256=') ? signature.slice(7) : signature;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(providedSig, 'hex'),
      Buffer.from(expectedSignature, 'hex'),
    );
  } catch {
    return false;
  }
}
