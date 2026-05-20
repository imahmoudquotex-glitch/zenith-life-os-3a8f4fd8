// packages/offline/src/__tests__/conflict.test.ts
// Wave: W03 — Unit tests for conflict resolution

import { describe, it, expect } from 'vitest';
import { getStrategy, resolve } from '../conflict';

const newer = { version: 2, updatedAt: '2026-05-20T10:00:00Z' };
const older  = { version: 1, updatedAt: '2026-05-19T10:00:00Z' };

describe('getStrategy', () => {
  it('tasks use last_write_wins', () => {
    expect(getStrategy('task')).toBe('last_write_wins');
  });

  it('notes use show_conflict', () => {
    expect(getStrategy('note')).toBe('show_conflict');
  });

  it('expenses use server_wins (financial data)', () => {
    expect(getStrategy('expense')).toBe('server_wins');
  });

  it('vault_items use server_wins', () => {
    expect(getStrategy('vault_item')).toBe('server_wins');
  });

  it('unknown entities default to last_write_wins', () => {
    expect(getStrategy('unknown_entity')).toBe('last_write_wins');
  });
});

describe('resolve', () => {
  describe('server_wins', () => {
    it('always returns server', () => {
      expect(resolve(newer, older, 'server_wins')).toBe('server');
    });
  });

  describe('client_wins', () => {
    it('always returns client', () => {
      expect(resolve(older, newer, 'client_wins')).toBe('client');
    });
  });

  describe('last_write_wins', () => {
    it('client wins when client version is higher', () => {
      expect(resolve(older, newer, 'last_write_wins')).toBe('client');
    });

    it('server wins when server version is higher', () => {
      expect(resolve(newer, older, 'last_write_wins')).toBe('server');
    });

    it('same version: client wins if client timestamp is newer', () => {
      const sv = { version: 3, updatedAt: '2026-05-19T10:00:00Z' };
      const cv = { version: 3, updatedAt: '2026-05-20T10:00:00Z' };
      expect(resolve(sv, cv, 'last_write_wins')).toBe('client');
    });

    it('same version: server wins if server timestamp is newer', () => {
      const sv = { version: 3, updatedAt: '2026-05-20T12:00:00Z' };
      const cv = { version: 3, updatedAt: '2026-05-20T10:00:00Z' };
      expect(resolve(sv, cv, 'last_write_wins')).toBe('server');
    });
  });

  describe('show_conflict', () => {
    it('returns show when versions differ', () => {
      expect(resolve(newer, older, 'show_conflict')).toBe('show');
    });

    it('returns server when versions are equal (no real conflict)', () => {
      const sv = { version: 2, updatedAt: '2026-05-20T10:00:00Z' };
      const cv = { version: 2, updatedAt: '2026-05-20T09:00:00Z' };
      expect(resolve(sv, cv, 'show_conflict')).toBe('server');
    });
  });
});
