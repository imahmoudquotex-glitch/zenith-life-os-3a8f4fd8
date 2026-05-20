// packages/sw/src/__tests__/deny-list.test.ts
// Wave: W03 — Unit tests for Service Worker deny-list (NetworkOnly patterns)

import { describe, it, expect } from 'vitest';
import { NEVER_CACHE_PATTERNS, shouldNeverCache } from '../deny-list';

describe('NEVER_CACHE_PATTERNS', () => {
  it('has at least 10 patterns', () => {
    expect(NEVER_CACHE_PATTERNS.length).toBeGreaterThanOrEqual(10);
  });

  it('covers /api/ prefix', () => {
    expect(NEVER_CACHE_PATTERNS.some((rx) => rx.test('/api/tasks'))).toBe(true);
  });

  it('covers /auth/ prefix', () => {
    expect(NEVER_CACHE_PATTERNS.some((rx) => rx.test('/auth/callback'))).toBe(true);
  });

  it('covers /vault/ prefix', () => {
    expect(NEVER_CACHE_PATTERNS.some((rx) => rx.test('/vault/items'))).toBe(true);
  });

  it('covers /api/csp-report exactly', () => {
    expect(NEVER_CACHE_PATTERNS.some((rx) => rx.test('/api/csp-report'))).toBe(true);
  });

  it('covers /api/push/', () => {
    expect(NEVER_CACHE_PATTERNS.some((rx) => rx.test('/api/push/subscribe'))).toBe(true);
  });
});

describe('shouldNeverCache', () => {
  const denied = [
    '/api/tasks',
    '/api/tasks/123',
    '/api/ai/suggest',
    '/api/billing/portal',
    '/api/webhooks/stripe',
    '/api/csrf',
    '/api/csp-report',
    '/api/push/subscribe',
    '/auth/callback',
    '/auth/signin',
    '/vault/items',
    '/vault/master-key',
    '/account/settings',
    '/settings/security/2fa',
    '/api/export/csv',
    '/api/import/csv',
    '/api/account/delete',
    '/api/api-keys/create',
    '/share/abc123/protected',
  ];

  const allowed = [
    '/',
    '/app',
    '/app/dashboard',
    '/offline.html',
    '/icons/icon-192.png',
    '/manifest.json',
    '/_next/static/chunks/main.js',
    '/favicon.ico',
    '/about',
  ];

  for (const url of denied) {
    it(`blocks (NetworkOnly): ${url}`, () => {
      expect(shouldNeverCache(url)).toBe(true);
    });
  }

  for (const url of allowed) {
    it(`allows (cacheable): ${url}`, () => {
      expect(shouldNeverCache(url)).toBe(false);
    });
  }
});
