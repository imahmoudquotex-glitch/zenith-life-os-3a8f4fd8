/**
 * Vault Envelope — full ZKE (Zero Knowledge Encryption) for vault items.
 *
 * Architecture (two-layer envelope):
 *   passphrase → Argon2id → KEK (Key Encryption Key)
 *   KEK + random IEK → XChaCha20-Poly1305 → wrappedIek
 *   IEK + plaintext → XChaCha20-Poly1305 → ciphertext
 *
 * The server NEVER sees the passphrase or the IEK in plaintext.
 * AAD binds each item to its workspaceId|userId|itemId|keyVersion.
 *
 * ADR-0003: Only XChaCha20-Poly1305 allowed. Only Argon2id for KDF.
 * See check:crypto for enforcement of forbidden primitives.
 */

import { xchaEncrypt, xchaDecrypt, XCHACHA20_KEY_BYTES } from './xchacha20';
import { deriveMasterKey, type KdfParams, DEFAULT_KDF } from './master-key';
const randomBytes = (len: number) => globalThis.crypto.getRandomValues(new Uint8Array(len));

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type VaultAlgo = 'XChaCha20-Poly1305';
export type VaultKdf = 'Argon2id';

export type VaultEnvelope = {
  readonly algo: VaultAlgo;
  readonly kdf: VaultKdf;
  readonly kdfParams: KdfParams;
  /** base64url encoded */
  readonly salt: string;
  /** base64url encoded — 24 bytes nonce for the data layer */
  readonly dataNonce: string;
  /** base64url encoded — ciphertext of plaintext */
  readonly ciphertext: string;
  /** base64url encoded — Poly1305 tag of ciphertext */
  readonly dataTag: string;
  /** base64url encoded — XChaCha20-Poly1305( KEK, IEK ) — includes nonce prepended */
  readonly wrappedIek: string;
  /** Additional Authenticated Data — workspace_id|user_id|item_id|vN */
  readonly aad: string;
  /** Monotonically increasing, allows key rotation */
  readonly keyVersion: number;
};

// ──────────────────────────────────────────────
// Base64url helpers (no dependencies, works in browser + Node)
// ──────────────────────────────────────────────

function toB64u(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]!);
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function fromB64u(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (padded.length % 4)) % 4;
  const b64 = padded + '='.repeat(pad);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

// ──────────────────────────────────────────────
// Core encrypt
// ──────────────────────────────────────────────

export async function encryptVaultItem(args: {
  plaintext: string;
  passphrase: string;
  workspaceId: string;
  userId: string;
  itemId: string;
  keyVersion?: number;
  kdfParams?: KdfParams;
}): Promise<VaultEnvelope> {
  const {
    plaintext, passphrase, workspaceId, userId, itemId,
    keyVersion = 1,
    kdfParams = DEFAULT_KDF,
  } = args;

  if (passphrase.length < 12) throw new Error('vault: passphrase_too_short (min 12 chars)');

  // 1. Derive Key Encryption Key (KEK) from passphrase
  const salt = randomBytes(kdfParams.saltLen);
  const kek = await deriveMasterKey(passphrase, salt, kdfParams);

  // 2. Generate random Item Encryption Key (IEK)
  const iek = randomBytes(XCHACHA20_KEY_BYTES);

  // 3. Build AAD
  const aadStr = `${workspaceId}|${userId}|${itemId}|v${keyVersion}`;
  const aadBytes = new TextEncoder().encode(aadStr);

  // 4. Encrypt plaintext with IEK
  const plaintextBytes = new TextEncoder().encode(plaintext);
  const { nonce: dataNonce, ciphertext, tag: dataTag } = xchaEncrypt(iek, plaintextBytes, aadBytes);

  // 5. Wrap IEK with KEK (nonce prepended into wrappedIek blob)
  const { nonce: wrapNonce, ciphertext: wrapCt, tag: wrapTag } = xchaEncrypt(kek, iek, aadBytes);
  // Store as: [24-byte nonce | ciphertext | 16-byte tag]
  const wrappedIekBlob = new Uint8Array(wrapNonce.length + wrapCt.length + wrapTag.length);
  wrappedIekBlob.set(wrapNonce, 0);
  wrappedIekBlob.set(wrapCt, wrapNonce.length);
  wrappedIekBlob.set(wrapTag, wrapNonce.length + wrapCt.length);

  return {
    algo: 'XChaCha20-Poly1305',
    kdf: 'Argon2id',
    kdfParams,
    salt: toB64u(salt),
    dataNonce: toB64u(dataNonce),
    ciphertext: toB64u(ciphertext),
    dataTag: toB64u(dataTag),
    wrappedIek: toB64u(wrappedIekBlob),
    aad: aadStr,
    keyVersion,
  };
}

// ──────────────────────────────────────────────
// Core decrypt
// ──────────────────────────────────────────────

export async function decryptVaultItem(args: {
  envelope: VaultEnvelope;
  passphrase: string;
}): Promise<string> {
  const { envelope, passphrase } = args;

  if (envelope.algo !== 'XChaCha20-Poly1305') {
    throw new Error(`vault: unsupported algo ${envelope.algo}`);
  }
  if (envelope.kdf !== 'Argon2id') {
    throw new Error(`vault: unsupported kdf ${envelope.kdf}`);
  }

  // 1. Re-derive KEK
  const salt = fromB64u(envelope.salt);
  const kek = await deriveMasterKey(passphrase, salt, envelope.kdfParams);

  // 2. Unwrap IEK
  const wrappedBlob = fromB64u(envelope.wrappedIek);
  const wrapNonce = wrappedBlob.subarray(0, 24);
  // wrappedBlob = [24 nonce | 32 ciphertext | 16 tag]
  const wrapCt = wrappedBlob.subarray(24, wrappedBlob.length - 16);
  const wrapTag = wrappedBlob.subarray(wrappedBlob.length - 16);
  const aadBytes = new TextEncoder().encode(envelope.aad);
  const iek = xchaDecrypt(kek, { nonce: wrapNonce, ciphertext: wrapCt, tag: wrapTag }, aadBytes);

  // 3. Decrypt ciphertext with IEK
  const dataNonce = fromB64u(envelope.dataNonce);
  const ciphertext = fromB64u(envelope.ciphertext);
  const dataTag = fromB64u(envelope.dataTag);
  const plaintext = xchaDecrypt(iek, { nonce: dataNonce, ciphertext, tag: dataTag }, aadBytes);

  return new TextDecoder().decode(plaintext);
}

// ──────────────────────────────────────────────
// Re-exports for backward compat
// ──────────────────────────────────────────────
export { deriveMasterKey } from './master-key';
export type { KdfParams } from './master-key';
export { DEFAULT_KDF } from './master-key';
