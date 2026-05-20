/**
 * Algorithm: XChaCha20-Poly1305 (libsodium-compatible, via @noble/ciphers)
 * Nonce: 24 bytes (192-bit) — safe for random generation, no counter needed.
 * Key: 32 bytes (256-bit) — must come from Argon2id derivation.
 * Forbidden ciphers: see ADR-0003 (check:crypto enforces this).
 */

import { xchacha20poly1305 } from '@noble/ciphers/chacha.js';
const randomBytes = (len: number) => globalThis.crypto.getRandomValues(new Uint8Array(len));

export const XCHACHA20_NONCE_BYTES = 24;
export const XCHACHA20_TAG_BYTES = 16;
export const XCHACHA20_KEY_BYTES = 32;

export type XChaChaEncrypted = {
  nonce: Uint8Array;    // 24 bytes
  ciphertext: Uint8Array; // plaintext length
  tag: Uint8Array;      // 16 bytes Poly1305
};

/**
 * Encrypt plaintext with XChaCha20-Poly1305.
 * @param key     32-byte key (derived from Argon2id KEK or IEK)
 * @param plaintext bytes to encrypt
 * @param aad     Additional Authenticated Data (workspace_id|user_id|item_id|version)
 */
export function xchaEncrypt(
  key: Uint8Array,
  plaintext: Uint8Array,
  aad: Uint8Array,
): XChaChaEncrypted {
  if (key.length !== XCHACHA20_KEY_BYTES) {
    throw new Error(`vault: key must be ${XCHACHA20_KEY_BYTES} bytes, got ${key.length}`);
  }
  const nonce = randomBytes(XCHACHA20_NONCE_BYTES);
  const cipher = xchacha20poly1305(key, nonce, aad);
  // noble/ciphers encrypt() returns ciphertext + 16-byte tag appended
  const sealed = cipher.encrypt(plaintext);
  const ciphertext = sealed.subarray(0, sealed.length - XCHACHA20_TAG_BYTES);
  const tag = sealed.subarray(sealed.length - XCHACHA20_TAG_BYTES);
  return { nonce, ciphertext, tag };
}

/**
 * Decrypt XChaCha20-Poly1305 ciphertext.
 * Throws on authentication failure (tampered data).
 */
export function xchaDecrypt(
  key: Uint8Array,
  encrypted: XChaChaEncrypted,
  aad: Uint8Array,
): Uint8Array {
  if (key.length !== XCHACHA20_KEY_BYTES) {
    throw new Error(`vault: key must be ${XCHACHA20_KEY_BYTES} bytes, got ${key.length}`);
  }
  const cipher = xchacha20poly1305(key, encrypted.nonce, aad);
  // Re-assemble ciphertext+tag for noble/ciphers decrypt()
  const sealed = new Uint8Array(encrypted.ciphertext.length + XCHACHA20_TAG_BYTES);
  sealed.set(encrypted.ciphertext, 0);
  sealed.set(encrypted.tag, encrypted.ciphertext.length);
  return cipher.decrypt(sealed);
}

/** Build canonical AAD string for vault items */
export function buildVaultAad(args: {
  workspaceId: string;
  userId: string;
  itemId: string;
  keyVersion: number;
}): Uint8Array {
  const aadStr = `${args.workspaceId}|${args.userId}|${args.itemId}|v${args.keyVersion}`;
  return new TextEncoder().encode(aadStr);
}
