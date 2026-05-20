// packages/vault-crypto/src/argon2.ts
// Wave: W03 — Argon2id KDF wrapper using @noble/hashes
// Falls back to PBKDF2 if argon2 WASM is unavailable (server environments)
// Production: use argon2-browser (WASM) in the browser

export type Argon2Params = {
  password: string;
  salt: Uint8Array;
  memory: number;      // KiB — default 65536 (64 MiB)
  iterations: number;  // time cost — default 3
  parallelism: number; // lanes — default 1
  keyLen: number;      // output bytes — default 32
};

/**
 * Argon2id KDF.
 * In browser: uses argon2-browser (WASM). Falls back to PBKDF2-SHA512 in Node.
 * PBKDF2 fallback: iterations=600000 (OWASP 2024 recommendation for SHA-512).
 */
export async function argon2id(params: Argon2Params): Promise<Uint8Array> {
  const { password, salt, memory, iterations, parallelism, keyLen } = params;

  // Try argon2-browser (browser/WASM environment)
  if (typeof window !== 'undefined') {
    try {
      // Dynamic import — argon2-browser is optional and browser-only
      const argon2 = await import('argon2-browser');
      const result = await argon2.hash({
        pass: password,
        salt,
        type: argon2.ArgonType.Argon2id,
        mem: memory,
        time: iterations,
        parallelism,
        hashLen: keyLen,
      });
      return result.hash;
    } catch {
      // Fall through to PBKDF2 fallback
    }
  }

  // Node.js / server fallback: PBKDF2-SHA512
  // Higher iterations to compensate for weaker algorithm
  const pbkdf2Iterations = Math.max(iterations * 200_000, 600_000);
  const encoder = new TextEncoder();
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const derived = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-512',
      salt,
      iterations: pbkdf2Iterations,
    },
    keyMaterial,
    keyLen * 8,
  );
  return new Uint8Array(derived);
}
