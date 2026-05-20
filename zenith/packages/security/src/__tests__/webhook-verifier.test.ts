// packages/security/src/__tests__/webhook-verifier.test.ts
// Wave: W03 — Unit tests for webhook signature + timestamp + anti-replay

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'node:crypto';
import { verifyWebhookSignature, verifySimpleHmacSignature } from '../webhook-verifier';

const SECRET = 'test_webhook_secret_12345678';

function buildHeader(payload: string, secret: string, offsetSeconds = 0): string {
  const ts = Math.floor(Date.now() / 1000) + offsetSeconds;
  const signed = `${ts}.${payload}`;
  const sig = crypto.createHmac('sha256', secret).update(signed).digest('hex');
  return `t=${ts},v1=${sig}`;
}

describe('verifyWebhookSignature', () => {
  it('returns valid=true for a correct signature', () => {
    const payload = JSON.stringify({ type: 'test.event' });
    const header = buildHeader(payload, SECRET);
    const { valid } = verifyWebhookSignature(payload, header, SECRET);
    expect(valid).toBe(true);
  });

  it('returns valid=false for wrong secret', () => {
    const payload = JSON.stringify({ type: 'test.event' });
    const header = buildHeader(payload, SECRET);
    const { valid } = verifyWebhookSignature(payload, header, 'wrong_secret');
    expect(valid).toBe(false);
  });

  it('returns valid=false for tampered payload', () => {
    const payload = JSON.stringify({ type: 'test.event' });
    const header = buildHeader(payload, SECRET);
    const { valid } = verifyWebhookSignature('{"type":"tampered"}', header, SECRET);
    expect(valid).toBe(false);
  });

  it('returns valid=false for expired timestamp (>5min old)', () => {
    const payload = JSON.stringify({ type: 'test.event' });
    const header = buildHeader(payload, SECRET, -400); // 400s ago
    const { valid } = verifyWebhookSignature(payload, header, SECRET);
    expect(valid).toBe(false);
  });

  it('returns valid=false for future timestamp (>30s ahead)', () => {
    const payload = JSON.stringify({ type: 'test.event' });
    const header = buildHeader(payload, SECRET, 60); // 60s in future
    const { valid } = verifyWebhookSignature(payload, header, SECRET);
    expect(valid).toBe(false);
  });

  it('accepts timestamp within 30s future tolerance', () => {
    const payload = JSON.stringify({ type: 'test.event' });
    const header = buildHeader(payload, SECRET, 10); // 10s ahead
    const { valid } = verifyWebhookSignature(payload, header, SECRET);
    expect(valid).toBe(true);
  });

  it('returns valid=false for missing t= field', () => {
    const { valid } = verifyWebhookSignature('payload', 'v1=abc123', SECRET);
    expect(valid).toBe(false);
  });

  it('returns valid=false for missing v1= field', () => {
    const { valid } = verifyWebhookSignature('payload', 't=1234567890', SECRET);
    expect(valid).toBe(false);
  });

  it('returns valid=false for non-numeric timestamp', () => {
    const { valid } = verifyWebhookSignature('payload', 't=notanumber,v1=abc', SECRET);
    expect(valid).toBe(false);
  });

  it('returns a nonce string', () => {
    const payload = JSON.stringify({ type: 'test.event' });
    const header = buildHeader(payload, SECRET);
    const { nonce } = verifyWebhookSignature(payload, header, SECRET);
    expect(typeof nonce).toBe('string');
    expect(nonce.length).toBeGreaterThan(0);
    expect(nonce).toMatch(/^\d+:/); // starts with timestamp
  });

  it('uses timingSafeEqual — length mismatch returns false not throws', () => {
    const payload = 'test';
    const ts = Math.floor(Date.now() / 1000);
    const header = `t=${ts},v1=tooshort`;
    const result = verifyWebhookSignature(payload, header, SECRET);
    expect(result.valid).toBe(false);
  });
});

describe('verifySimpleHmacSignature', () => {
  it('returns true for correct signature', () => {
    const payload = 'test payload';
    const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    expect(verifySimpleHmacSignature(payload, sig, SECRET)).toBe(true);
  });

  it('accepts sha256= prefixed signatures (GitHub style)', () => {
    const payload = 'test payload';
    const sig = 'sha256=' + crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    expect(verifySimpleHmacSignature(payload, sig, SECRET)).toBe(true);
  });

  it('returns false for wrong secret', () => {
    const payload = 'test payload';
    const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    expect(verifySimpleHmacSignature(payload, sig, 'wrong')).toBe(false);
  });

  it('returns false for tampered payload', () => {
    const payload = 'test payload';
    const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    expect(verifySimpleHmacSignature('tampered', sig, SECRET)).toBe(false);
  });

  it('returns false for invalid hex (length mismatch)', () => {
    expect(verifySimpleHmacSignature('payload', 'abc', SECRET)).toBe(false);
  });
});
