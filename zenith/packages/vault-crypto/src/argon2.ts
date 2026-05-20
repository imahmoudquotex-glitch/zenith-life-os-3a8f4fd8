/**
 * Argon2id WASM wrapper — browser-compatible stub.
 * Production: replace with argon2-browser or @node-rs/argon2.
 */
export type Argon2idParams = {
  password: string;
  salt: Uint8Array;
  memory: number;
  iterations: number;
  parallelism: number;
  hashLen: number;
};

/** Stub — returns scrypt in Node for unit tests. In browser, load argon2-browser WASM. */
export async function argon2id(_params: Argon2idParams): Promise<Uint8Array> {
  // Real implementation: dynamically import 'argon2-browser' in browser context
  throw new Error('argon2id WASM not loaded. Import argon2-browser in browser context.');
}
