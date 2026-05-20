/**
 * AES-GCM-256 encrypt/decrypt using WebCrypto API.
 * Works in browser and Node 18+ (globalThis.crypto.subtle).
 * isExtractable=false enforced.
 */

/**
 * Safely copy a Uint8Array into a fresh ArrayBuffer.
 * Required because TypeScript types `Uint8Array.buffer` as `ArrayBufferLike`
 * which includes `SharedArrayBuffer`, but SubtleCrypto requires plain `ArrayBuffer`.
 */
function toSafeBuffer(u: Uint8Array): ArrayBuffer {
  const dst = new ArrayBuffer(u.byteLength);
  new Uint8Array(dst).set(u);
  return dst;
}

export async function encryptAesGcm(
  key: Uint8Array,
  plaintext: Uint8Array,
  aad?: string,
): Promise<{ ciphertext: Uint8Array; iv: Uint8Array }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    toSafeBuffer(key),
    'AES-GCM',
    false,
    ['encrypt'],
  );
  const ct = new Uint8Array(
    await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: toSafeBuffer(iv),
        additionalData: aad ? new TextEncoder().encode(aad) : undefined,
      },
      cryptoKey,
      toSafeBuffer(plaintext),
    ),
  );
  return { ciphertext: ct, iv };
}

export async function decryptAesGcm(
  key: Uint8Array,
  ciphertext: Uint8Array,
  iv: Uint8Array,
  aad?: string,
): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    toSafeBuffer(key),
    'AES-GCM',
    false,
    ['decrypt'],
  );
  return new Uint8Array(
    await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: toSafeBuffer(iv),
        additionalData: aad ? new TextEncoder().encode(aad) : undefined,
      },
      cryptoKey,
      toSafeBuffer(ciphertext),
    ),
  );
}
