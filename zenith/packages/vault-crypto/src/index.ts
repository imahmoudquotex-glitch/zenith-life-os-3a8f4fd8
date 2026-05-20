// packages/vault-crypto/src/index.ts
// Wave: W03 — Public API for vault-crypto package

export { encryptAesGcm, decryptAesGcm, generateAesKey } from './aes-gcm';
export { argon2id, type Argon2Params } from './argon2';
export {
  deriveMasterKey,
  generateSalt,
  computeVerifier,
  secureClear,
  type KdfParams,
  DEFAULT_KDF,
} from './master-key';
export { generateItemKey, wrapItemKey, unwrapItemKey } from './item-key';
export { sealVaultItem, openVaultItem, type VaultEnvelope } from './envelope';
