// packages/vault-crypto/src/master-key.ts
// Wave: W03 — Derive master key from user passphrase using Argon2id
// NEVER upload master key to server. Memory-only. Wipe on logout.

import { argon2id } from './argon2';

export type KdfParams = {
  memory: number;       // KiB (default 65536 = 64 MiB)
  iterations: number;   // time cost (default 3)
  parallelism: number;  // lanes (default 1)
  saltLen: number;      // salt bytes (default 16)
  keyLen: number;       // output bytes (default 32)
};

export const DEFAULT_KDF: KdfParams = {
  memory: 65536,
  iterations: 3,
  parallelism: 1,
  saltLen: 16,
  keyLen: 32,
};

/**
 * Derive master encryption key from passphrase + salt using Argon2id.
 * Passphrase must be ≥12 chars.
 * Salt must be cryptographically random (from vault_master_key_meta.salt).
 * Result is a 32-byte key for AES-GCM-256.
 *
 * ⚠️ NEVER store this key in localStorage, IndexedDB persistent, or send to server.
 * Keep in memory only. Wipe with secureClear() on lock/logout.
 */
export async function deriveMasterKey(
  passphrase: string,
  salt: Uint8Array,
  params: KdfParams = DEFAULT_KDF,
): Promise<Uint8Array> {
  if (passphrase.length < 12) {
    throw new Error('VAULT_PASSPHRASE_TOO_SHORT');
  }
  if (salt.length < params.saltLen) {
    throw new Error('VAULT_SALT_TOO_SHORT');
  }
  return argon2id({
    password: passphrase,
    salt,
    memory: params.memory,
    iterations: params.iterations,
    parallelism: params.parallelism,
    keyLen: params.keyLen,
  });
}

/**
 * Generate a random salt for KDF.
 */
export function generateSalt(len = 16): Uint8Array {
  return globalThis.crypto.getRandomValues(new Uint8Array(len));
}

/**
 * Compute passphrase verifier = SHA-256(masterKey || salt).
 * Stored in vault_master_key_meta.verifier — NOT the key itself.
 */
export async function computeVerifier(masterKey: Uint8Array, salt: Uint8Array): Promise<Uint8Array> {
  const combined = new Uint8Array(masterKey.length + salt.length);
  combined.set(masterKey);
  combined.set(salt, masterKey.length);
  const hash = await globalThis.crypto.subtle.digest('SHA-256', combined);
  return new Uint8Array(hash);
}

/**
 * Securely zero-fill a Uint8Array to wipe key material from memory.
 * Call on lock, logout, and visibilitychange (hidden).
 */
export function secureClear(buf: Uint8Array): void {
  buf.fill(0);
}
