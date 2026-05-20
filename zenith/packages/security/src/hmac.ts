import 'server-only';
import crypto from 'node:crypto';
import { type Clock, systemClock } from '@zenith/shared/time';

export function safeTimingEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export type VerifyParams = {
  rawBody: string;
  timestamp: string;
  signature: string;
  secret: string;
  toleranceMs?: number;
  clock?: Clock;
};

export function verifySignedPayload(p: VerifyParams): { ok: boolean; reason?: string } {
  const clock = p.clock ?? systemClock;
  const tolerance = p.toleranceMs ?? 5 * 60 * 1000;
  const ts = Number(p.timestamp);
  if (!Number.isFinite(ts)) return { ok: false, reason: 'bad_timestamp' };
  const age = Math.abs(clock.nowMs() - ts);
  if (age > tolerance) return { ok: false, reason: 'timestamp_skewed' };
  const expected = crypto.createHmac('sha256', p.secret)
    .update(`${p.timestamp}.${p.rawBody}`)
    .digest('hex');
  if (!safeTimingEqual(p.signature, expected)) return { ok: false, reason: 'signature_invalid' };
  return { ok: true };
}
