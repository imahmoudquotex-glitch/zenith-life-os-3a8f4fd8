// @zenith/crypto — Vault (Zero-Knowledge Envelope Encryption)
// Reviewer issues #32, #44: Vault plaintext never reaches AI, logs, or client-side.
// See ADR-0007-vault-zke.md

import type { Result } from '@zenith/shared/result';

export interface VaultItem {
  readonly id: string;
  readonly workspaceId: string;
  readonly ownerUserId: string;
  readonly wrappedIek: Uint8Array;    // Wrapped Item Encryption Key
  readonly nonce: Uint8Array;
  readonly aeadTag: Uint8Array;
  readonly encryptionAlgo: 'AES-256-GCM' | 'XChaCha20-Poly1305';
  readonly kdfParams: {
    readonly algo: 'PBKDF2' | 'Argon2id';
    readonly iterations?: number;
    readonly memory?: number;
    readonly parallelism?: number;
    readonly salt: string;
  };
  readonly keyVersion: number;
  readonly aadContext: string;         // Additional Authenticated Data
  readonly ciphertext: Uint8Array;
  readonly version: number;
}

export interface VaultKeyDerivation {
  deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey>;
}

/**
 * Vault — envelope encryption for sensitive workspace data.
 * Stub implementation for Wave 00.
 *
 * Production flow:
 * 1. User provides passphrase → derive KEK via PBKDF2/Argon2id
 * 2. Generate random IEK (Item Encryption Key)
 * 3. Encrypt data with IEK using AES-256-GCM
 * 4. Wrap IEK with KEK
 * 5. Store wrapped IEK + ciphertext + nonce + tag
 * 6. KEK never stored — derived on-demand from passphrase
 */
export class Vault {
  async encrypt(_plaintext: string, _workspaceId: string, _userId: string): Promise<Result<VaultItem>> {
    return {
      ok: false,
      error: {
        code: 'VAULT_NOT_IMPLEMENTED',
        message: 'Vault encryption not yet implemented. Will use Web Crypto API.',
      },
    };
  }

  async decrypt(_item: VaultItem, _passphrase: string): Promise<Result<string>> {
    return {
      ok: false,
      error: {
        code: 'VAULT_NOT_IMPLEMENTED',
        message: 'Vault decryption not yet implemented.',
      },
    };
  }
}

/**
 * Guard: Ensure no vault plaintext is leaked to AI, logs, or client.
 */
export function assertNoVaultPlaintext(data: unknown): boolean {
  if (typeof data === 'string') {
    return !data.includes('vault:decrypted:');
  }
  if (typeof data === 'object' && data !== null) {
    return Object.values(data as Record<string, unknown>).every(assertNoVaultPlaintext);
  }
  return true;
}
