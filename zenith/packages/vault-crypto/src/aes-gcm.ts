// packages/vault-crypto/src/aes-gcm.ts
// Wave: W03 — AES-GCM-256 encrypt/decrypt using Web Crypto API
// Works in browser and Node 20+ (uses globalThis.crypto)

/**
 * Encrypt plaintext with AES-GCM-256.
 * Returns ciphertext (includes 16-byte auth tag appended by Web Crypto) + IV.
 * isExtractable = false — key cannot be exported after import.
 */
export async function encryptAesGcm(
  key: Uint8Array,
  plaintext: Uint8Array,
  aad?: string,
): Promise<{ ciphertext: Uint8Array; iv: Uint8Array }> {
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    'raw',
    key,
    'AES-GCM',
    false, // isExtractable MUST be false
    ['encrypt'],
  );
  const additionalData = aad ? new TextEncoder().encode(aad) : undefined;
  const ciphertextBuf = await globalThis.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData },
    cryptoKey,
    plaintext,
  );
  return { ciphertext: new Uint8Array(ciphertextBuf), iv };
}

/**
 * Decrypt ciphertext with AES-GCM-256.
 * Throws if authentication tag is invalid (tampered data).
 */
export async function decryptAesGcm(
  key: Uint8Array,
  ciphertext: Uint8Array,
  iv: Uint8Array,
  aad?: string,
): Promise<Uint8Array> {
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    'raw',
    key,
    'AES-GCM',
    false,
    ['decrypt'],
  );
  const additionalData = aad ? new TextEncoder().encode(aad) : undefined;
  const plaintext = await globalThis.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv, additionalData },
    cryptoKey,
    ciphertext,
  );
  return new Uint8Array(plaintext);
}

/** Generate a random 32-byte AES-256 key */
export function generateAesKey(): Uint8Array {
  return globalThis.crypto.getRandomValues(new Uint8Array(32));
}
