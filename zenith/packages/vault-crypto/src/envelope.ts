// packages/vault-crypto/src/envelope.ts
// Wave: W03 — Ciphertext envelope format for vault items

import { encryptAesGcm, decryptAesGcm } from './aes-gcm';
import { generateItemKey, wrapItemKey, unwrapItemKey } from './item-key';

export type VaultEnvelope = {
  algo: 'AES-GCM-256';
  ciphertext: Uint8Array;   // encrypted item value (ciphertext + auth_tag appended)
  iv: Uint8Array;           // 12-byte random IV for item encryption
  wrappedItemKey: Uint8Array; // item key wrapped with master key
  wrapIv: Uint8Array;       // IV used to wrap item key
  aad: string;              // 'workspace_id|user_id|item_id' — for integrity binding
  keyVersion: number;       // master key version
};

/**
 * Encrypt a vault item value.
 * AAD binds the ciphertext to its workspace+user+item — prevents moving ciphertext across accounts.
 */
export async function sealVaultItem(
  plaintext: string,
  masterKey: Uint8Array,
  context: { workspaceId: string; userId: string; itemId: string; keyVersion?: number },
): Promise<VaultEnvelope> {
  const aad = `${context.workspaceId}|${context.userId}|${context.itemId}`;
  const itemKey = generateItemKey();

  // Encrypt plaintext with per-item key
  const { ciphertext, iv } = await encryptAesGcm(
    itemKey,
    new TextEncoder().encode(plaintext),
    aad,
  );

  // Wrap item key with master key
  const { wrappedKey, wrapIv } = await wrapItemKey(itemKey, masterKey, aad);

  // Wipe item key from memory
  itemKey.fill(0);

  return {
    algo: 'AES-GCM-256',
    ciphertext,
    iv,
    wrappedItemKey: wrappedKey,
    wrapIv,
    aad,
    keyVersion: context.keyVersion ?? 1,
  };
}

/**
 * Decrypt a vault item envelope.
 * Verifies AAD integrity — throws if context doesn't match.
 */
export async function openVaultItem(
  envelope: VaultEnvelope,
  masterKey: Uint8Array,
  context: { workspaceId: string; userId: string; itemId: string },
): Promise<string> {
  const expectedAad = `${context.workspaceId}|${context.userId}|${context.itemId}`;
  if (envelope.aad !== expectedAad) {
    throw new Error('VAULT_AAD_MISMATCH');
  }

  // Unwrap item key
  const itemKey = await unwrapItemKey(
    envelope.wrappedItemKey,
    envelope.wrapIv,
    masterKey,
    envelope.aad,
  );

  // Decrypt value
  const plaintext = await decryptAesGcm(itemKey, envelope.ciphertext, envelope.iv, envelope.aad);

  // Wipe item key from memory
  itemKey.fill(0);

  return new TextDecoder().decode(plaintext);
}
