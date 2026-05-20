import type { Clock } from '@zenith/shared/time';

export type KdfParams = {
  memory: number;
  iterations: number;
  parallelism: number;
  saltLen: number;
  keyLen: number;
};

export const DEFAULT_KDF: KdfParams = {
  memory: 65536,    // 64 MiB
  iterations: 3,
  parallelism: 1,
  saltLen: 16,
  keyLen: 32,
};

// Silence unused import — Clock is used by downstream callers who inject it
void (undefined as unknown as Clock);

/**
 * Derives a master key from a passphrase using Argon2id (via WASM).
 * In Node environments, falls back to scrypt for testing only.
 * Production: load argon2-browser or @node-rs/argon2.
 */
export async function deriveMasterKey(
  passphrase: string,
  salt: Uint8Array,
  params: KdfParams = DEFAULT_KDF,
): Promise<Uint8Array> {
  if (passphrase.length < 12) throw new Error('passphrase_too_short');

  // Browser: use argon2-browser WASM
  if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>)['argon2']) {
    // Dynamic import — argon2-browser is a peer dependency loaded by the app
    const argon2 = await import('argon2-browser') as {
      hash: (p: {
        pass: string;
        salt: Uint8Array;
        time: number;
        mem: number;
        parallelism: number;
        hashLen: number;
        type: number;
      }) => Promise<{ hash: Uint8Array }>;
    };
    const result = await argon2.hash({
      pass: passphrase,
      salt,
      time: params.iterations,
      mem: params.memory,
      parallelism: params.parallelism,
      hashLen: params.keyLen,
      type: 2, // Argon2id
    });
    return result.hash;
  }

  // Fallback for Node.js (tests only — NOT for production)
  const { scrypt } = await import('node:crypto');
  return new Promise<Uint8Array>((resolve, reject) => {
    scrypt(passphrase, salt, params.keyLen, { N: 16384, r: 8, p: 1 }, (err, key) => {
      if (err) reject(err);
      else resolve(new Uint8Array(key));
    });
  });
}
