// packages/vault-crypto/src/__tests__/master-key.test.ts
// Wave: W03 — Unit tests for deriveMasterKey + computeVerifier + secureClear

import { describe, it, expect } from 'vitest';
import { deriveMasterKey, generateSalt, computeVerifier, secureClear, DEFAULT_KDF } from '../master-key';

describe('deriveMasterKey', () => {
  it('derives a 32-byte key from passphrase + salt', async () => {
    const salt = generateSalt();
    const key = await deriveMasterKey('my-passphrase-123', salt);
    expect(key).toBeInstanceOf(Uint8Array);
    expect(key.length).toBe(32);
  });

  it('is deterministic: same inputs → same key', async () => {
    const salt = generateSalt();
    const k1 = await deriveMasterKey('same-pass-1234', salt, DEFAULT_KDF);
    const k2 = await deriveMasterKey('same-pass-1234', salt, DEFAULT_KDF);
    expect(Buffer.from(k1).toString('hex')).toBe(Buffer.from(k2).toString('hex'));
  });

  it('different salts produce different keys', async () => {
    const s1 = generateSalt();
    const s2 = generateSalt();
    const k1 = await deriveMasterKey('same-pass-1234', s1);
    const k2 = await deriveMasterKey('same-pass-1234', s2);
    expect(Buffer.from(k1).toString('hex')).not.toBe(Buffer.from(k2).toString('hex'));
  });

  it('throws for passphrase shorter than 12 chars', async () => {
    const salt = generateSalt();
    await expect(deriveMasterKey('short', salt)).rejects.toThrow('VAULT_PASSPHRASE_TOO_SHORT');
  });

  it('throws for salt shorter than required', async () => {
    const shortSalt = new Uint8Array(8); // less than 16
    await expect(
      deriveMasterKey('long-enough-pass', shortSalt)
    ).rejects.toThrow('VAULT_SALT_TOO_SHORT');
  });
});

describe('generateSalt', () => {
  it('returns 16 bytes by default', () => {
    expect(generateSalt().length).toBe(16);
  });

  it('returns requested length', () => {
    expect(generateSalt(32).length).toBe(32);
  });

  it('two salts are never equal', () => {
    const s1 = generateSalt();
    const s2 = generateSalt();
    expect(Buffer.from(s1).toString('hex')).not.toBe(Buffer.from(s2).toString('hex'));
  });
});

describe('computeVerifier', () => {
  it('returns 32 bytes (SHA-256)', async () => {
    const key = new Uint8Array(32).fill(1);
    const salt = generateSalt();
    const v = await computeVerifier(key, salt);
    expect(v.length).toBe(32);
  });

  it('same inputs produce same verifier', async () => {
    const key = new Uint8Array(32).fill(7);
    const salt = generateSalt();
    const v1 = await computeVerifier(key, salt);
    const v2 = await computeVerifier(key, salt);
    expect(Buffer.from(v1).toString('hex')).toBe(Buffer.from(v2).toString('hex'));
  });
});

describe('secureClear', () => {
  it('fills buffer with zeros', () => {
    const buf = new Uint8Array([1, 2, 3, 4, 5]);
    secureClear(buf);
    expect(buf.every((b) => b === 0)).toBe(true);
  });
});
