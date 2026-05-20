/**
 * @app/vault-crypto — Zero-Knowledge Encryption for Zenith Vault
 *
 * Public API:
 *   encryptVaultItem(args) -> VaultEnvelope
 *   decryptVaultItem(args) -> string
 *
 * Algorithm: XChaCha20-Poly1305 (data + key wrapping)
 * KDF:       Argon2id (t=3, m=64MiB, p=1)
 *
 * Forbidden ciphers and KDFs: see ADR-0003 + check:crypto script.
 */

export { encryptVaultItem, decryptVaultItem } from './envelope';
export type { VaultEnvelope, VaultAlgo, VaultKdf } from './envelope';
export { deriveMasterKey, DEFAULT_KDF } from './master-key';
export type { KdfParams } from './master-key';
export { xchaEncrypt, xchaDecrypt, buildVaultAad } from './xchacha20';
export type { XChaChaEncrypted } from './xchacha20';
