/**
 * @zenith/vault — Zero-Knowledge Vault Interfaces
 *
 * INV-04: Vault content NEVER appears in:
 * - AI prompts/responses
 * - Analytics events
 * - Audit logs (only hashed item_id)
 * - IndexedDB / localStorage
 * - Server logs / SSR cache
 * - Sentry events
 *
 * Only functions ending in `Decrypted` may return plaintext.
 * Implementation in Phase 06.
 */

export interface VaultItem {
  readonly id: string
  readonly workspaceId: string
  readonly ownerUserId: string
  readonly title: string // encrypted
  readonly encryptedBlob: Uint8Array
  readonly encryptionKeyId: string
  readonly createdAt: string
  readonly updatedAt: string
}

export interface VaultItemDecrypted {
  readonly id: string
  readonly title: string
  readonly content: string
  readonly metadata: Record<string, unknown>
}

export interface VaultService {
  /** Store an encrypted vault item */
  store(item: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<VaultItem>

  /** Retrieve and decrypt a vault item — only via *Decrypted suffix */
  getDecrypted(id: string, masterKey: Uint8Array): Promise<VaultItemDecrypted | null>

  /** List vault items (metadata only, no plaintext) */
  list(workspaceId: string): Promise<VaultItem[]>

  /** Delete a vault item */
  delete(id: string): Promise<void>
}
