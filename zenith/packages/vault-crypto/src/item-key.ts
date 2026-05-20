// packages/vault-crypto/src/item-key.ts
// Wave: W03 — Per-item key generation + wrap/unwrap with master key

import { encryptAesGcm, decryptAesGcm, generateAesKey } from './aes-gcm';

/**
 * Generate a random per-item encryption key (32 bytes).
 */
export function generateItemKey(): Uint8Array {
  return generateAesKey();
}

/**
 * Wrap (encrypt) item key with master key using AES-GCM.
 * The wrapped key is safe to store in vault_items.wrapped_item_key.
 */
export async function wrapItemKey(
  itemKey: Uint8Array,
  masterKey: Uint8Array,
  aad?: string,
): Promise<{ wrappedKey: Uint8Array; wrapIv: Uint8Array }> {
  const { ciphertext, iv } = await encryptAesGcm(masterKey, itemKey, aad);
  return { wrappedKey: ciphertext, wrapIv: iv };
}

/**
 * Unwrap (decrypt) item key using master key.
 * Returns the raw 32-byte item key for decryption.
 */
export async function unwrapItemKey(
  wrappedKey: Uint8Array,
  wrapIv: Uint8Array,
  masterKey: Uint8Array,
  aad?: string,
): Promise<Uint8Array> {
  return decryptAesGcm(masterKey, wrappedKey, wrapIv, aad);
}
