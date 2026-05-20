/**
 * @zenith/crypto — Zero-Knowledge Encryption Contract
 * 
 * INV-04: All encryption primitives live here.
 * Phase 00 contract only — implementation in Phase 06.
 * 
 * Approved Primitives:
 * - KDF: Argon2id (t=3, m=64MiB, p=4, salt=16B)
 * - Symmetric: XChaCha20-Poly1305 AEAD (nonce=24B)
 * - Asymmetric: X25519 ECDH + sealed boxes
 * - Recovery: Shamir's Secret Sharing 3-of-5
 * 
 * BANNED: See docs/invariants.md for the full deny-list.
 */

/** Encrypted item envelope */
export interface EncryptedEnvelope {
  /** Encrypted data (base64) */
  ciphertext: string
  /** 24-byte nonce (base64) */
  nonce: string
  /** Item Encryption Key wrapped by Master Key (base64) */
  wrappedIek: string
  /** Additional Authenticated Data */
  aad: {
    workspaceId: string
    itemId: string
    version: number
  }
  /** Algorithm identifier */
  algorithm: 'xchacha20-poly1305'
}

/** Key derivation parameters */
export interface KDFParams {
  algorithm: 'argon2id'
  timeCost: 3
  memoryCost: 65536 // 64 MiB in KiB
  parallelism: 4
  saltLength: 16
  keyLength: 32
}

/** Default KDF params — frozen */
export const DEFAULT_KDF_PARAMS: KDFParams = {
  algorithm: 'argon2id',
  timeCost: 3,
  memoryCost: 65536,
  parallelism: 4,
  saltLength: 16,
  keyLength: 32,
}

// ─── Stubs — implemented in Phase 06 ─────────────────

export async function deriveKey(
  _passphrase: string,
  _salt: Uint8Array,
  _params?: Partial<KDFParams>,
): Promise<Uint8Array> {
  throw new Error('CRYPTO_NOT_IMPLEMENTED: Phase 06 will implement key derivation')
}

export async function encrypt(
  _plaintext: Uint8Array,
  _key: Uint8Array,
  _aad: EncryptedEnvelope['aad'],
): Promise<EncryptedEnvelope> {
  throw new Error('CRYPTO_NOT_IMPLEMENTED: Phase 06 will implement encryption')
}

export async function decrypt(
  _envelope: EncryptedEnvelope,
  _key: Uint8Array,
): Promise<Uint8Array> {
  throw new Error('CRYPTO_NOT_IMPLEMENTED: Phase 06 will implement decryption')
}
