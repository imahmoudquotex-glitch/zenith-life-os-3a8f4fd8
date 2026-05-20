// packages/vault-crypto/src/__tests__/envelope.test.ts
// Wave: W03 — Integration tests for full vault seal/open flow

import { describe, it, expect } from 'vitest';
import { sealVaultItem, openVaultItem } from '../envelope';
import { generateAesKey } from '../aes-gcm';

const ctx = {
  workspaceId: 'ws_test_01',
  userId: 'usr_test_01',
  itemId: 'itm_test_01',
  keyVersion: 1,
};

describe('VaultEnvelope', () => {
  it('seals and opens a vault item', async () => {
    const masterKey = generateAesKey();
    const plaintext = 'my super secret password';

    const envelope = await sealVaultItem(plaintext, masterKey, ctx);
    const result = await openVaultItem(envelope, masterKey, ctx);

    expect(result).toBe(plaintext);
  });

  it('fails to open with wrong master key', async () => {
    const masterKey = generateAesKey();
    const wrongKey = generateAesKey();

    const envelope = await sealVaultItem('secret', masterKey, ctx);
    await expect(openVaultItem(envelope, wrongKey, ctx)).rejects.toThrow();
  });

  it('fails to open with wrong context (AAD mismatch)', async () => {
    const masterKey = generateAesKey();
    const envelope = await sealVaultItem('secret', masterKey, ctx);

    const wrongCtx = { ...ctx, itemId: 'itm_different' };
    await expect(openVaultItem(envelope, masterKey, wrongCtx)).rejects.toThrow('VAULT_AAD_MISMATCH');
  });

  it('envelope algo is AES-GCM-256', async () => {
    const masterKey = generateAesKey();
    const envelope = await sealVaultItem('secret', masterKey, ctx);
    expect(envelope.algo).toBe('AES-GCM-256');
  });

  it('envelope contains expected fields', async () => {
    const masterKey = generateAesKey();
    const envelope = await sealVaultItem('test', masterKey, ctx);
    expect(envelope.iv).toBeInstanceOf(Uint8Array);
    expect(envelope.iv.length).toBe(12);
    expect(envelope.ciphertext).toBeInstanceOf(Uint8Array);
    expect(envelope.wrappedItemKey).toBeInstanceOf(Uint8Array);
    expect(envelope.wrapIv).toBeInstanceOf(Uint8Array);
    expect(envelope.aad).toBe('ws_test_01|usr_test_01|itm_test_01');
    expect(envelope.keyVersion).toBe(1);
  });

  it('two seals of same plaintext produce different ciphertexts', async () => {
    const masterKey = generateAesKey();
    const e1 = await sealVaultItem('same', masterKey, ctx);
    const e2 = await sealVaultItem('same', masterKey, ctx);
    expect(Buffer.from(e1.ciphertext).toString('hex'))
      .not.toBe(Buffer.from(e2.ciphertext).toString('hex'));
  });
});
