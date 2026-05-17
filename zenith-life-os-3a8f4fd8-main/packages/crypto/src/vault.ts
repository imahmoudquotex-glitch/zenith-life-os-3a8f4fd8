// @zenith/crypto — Vault (stub)
// Reviewer issue #32: Zero-knowledge envelope encryption.
// No plaintext vault data in AI prompts, logs, or client-side.

import type { Result } from '@zenith/shared/result';

export interface VaultItem {
  id: string;
  workspaceId: string;
  encryptedData: string;  // encrypted at rest
  iv: string;
  tag: string;
}

/**
 * Vault — envelope encryption for sensitive workspace data.
 * Stub implementation for Wave 00.
 */
export class Vault {
  async encrypt(_plaintext: string, _workspaceId: string): Promise<Result<VaultItem>> {
    return {
      ok: false,
      error: {
        code: 'VAULT_NOT_IMPLEMENTED',
        message: 'Vault not yet implemented',
      },
    };
  }

  async decrypt(_item: VaultItem): Promise<Result<string>> {
    return {
      ok: false,
      error: {
        code: 'VAULT_NOT_IMPLEMENTED',
        message: 'Vault not yet implemented',
      },
    };
  }
}
