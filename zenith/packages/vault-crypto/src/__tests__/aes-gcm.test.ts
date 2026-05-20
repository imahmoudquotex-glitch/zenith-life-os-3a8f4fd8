// packages/vault-crypto/src/__tests__/aes-gcm.test.ts
// Wave: W03 — Unit tests for AES-GCM-256 encrypt/decrypt

import { describe, it, expect } from 'vitest';
import { encryptAesGcm, decryptAesGcm, generateAesKey } from '../aes-gcm';

describe('AES-GCM-256', () => {
  it('encrypts and decrypts a plaintext', async () => {
    const key = generateAesKey();
    const plaintext = new TextEncoder().encode('hello vault');

    const { ciphertext, iv } = await encryptAesGcm(key, plaintext);
    const decrypted = await decryptAesGcm(key, ciphertext, iv);

    expect(new TextDecoder().decode(decrypted)).toBe('hello vault');
  });

  it('ciphertext differs from plaintext', async () => {
    const key = generateAesKey();
    const plaintext = new TextEncoder().encode('hello vault');
    const { ciphertext } = await encryptAesGcm(key, plaintext);
    expect(Buffer.from(ciphertext).toString()).not.toBe('hello vault');
  });

  it('produces different ciphertext each call (random IV)', async () => {
    const key = generateAesKey();
    const plaintext = new TextEncoder().encode('same text');
    const { ciphertext: c1, iv: iv1 } = await encryptAesGcm(key, plaintext);
    const { ciphertext: c2, iv: iv2 } = await encryptAesGcm(key, plaintext);
    // IVs must differ
    expect(Buffer.from(iv1).toString('hex')).not.toBe(Buffer.from(iv2).toString('hex'));
    // Ciphertexts must differ
    expect(Buffer.from(c1).toString('hex')).not.toBe(Buffer.from(c2).toString('hex'));
  });

  it('decryption fails with wrong key', async () => {
    const key = generateAesKey();
    const wrongKey = generateAesKey();
    const plaintext = new TextEncoder().encode('secret');
    const { ciphertext, iv } = await encryptAesGcm(key, plaintext);
    await expect(decryptAesGcm(wrongKey, ciphertext, iv)).rejects.toThrow();
  });

  it('decryption fails with tampered ciphertext', async () => {
    const key = generateAesKey();
    const plaintext = new TextEncoder().encode('secret');
    const { ciphertext, iv } = await encryptAesGcm(key, plaintext);
    ciphertext[0] ^= 0xff; // flip a bit
    await expect(decryptAesGcm(key, ciphertext, iv)).rejects.toThrow();
  });

  it('respects AAD — decryption fails with wrong AAD', async () => {
    const key = generateAesKey();
    const plaintext = new TextEncoder().encode('secret');
    const { ciphertext, iv } = await encryptAesGcm(key, plaintext, 'correct-aad');
    await expect(decryptAesGcm(key, ciphertext, iv, 'wrong-aad')).rejects.toThrow();
  });

  it('generateAesKey returns 32 bytes', () => {
    const key = generateAesKey();
    expect(key.length).toBe(32);
  });
});
