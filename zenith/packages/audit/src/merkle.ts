/**
 * Audit Merkle Chain — tamper-evident daily anchoring.
 * SHA-256 chain over ordered (id, prev_hash, row_hash) audit events.
 * ADR: daily roots stored in audit_daily_anchors table.
 */

export interface AuditEvent {
  id: string
  prevHash: string
  rowHash: string
  workspaceId: string
  createdAt: string
}

/**
 * Compute SHA-256 Merkle root from ordered audit events.
 * Events MUST be sorted by id ASC for determinism.
 */
export async function computeMerkleRoot(events: AuditEvent[]): Promise<Uint8Array> {
  if (events.length === 0) {
    return new Uint8Array(32) // zero root for empty set
  }

  const encoder = new TextEncoder()
  let leaves: Uint8Array[] = await Promise.all(
    events.map(async (e) => {
      const data = encoder.encode(`${e.id}|${e.prevHash}|${e.rowHash}`)
      const hash = await crypto.subtle.digest('SHA-256', data)
      return new Uint8Array(hash)
    })
  )

  // Reduce to single root (binary tree)
  while (leaves.length > 1) {
    const next: Uint8Array[] = []
    for (let i = 0; i < leaves.length; i += 2) {
      const left = leaves[i]!
      const right = leaves[i + 1] ?? left // duplicate last if odd
      const combined = new Uint8Array(64)
      combined.set(left, 0)
      combined.set(right, 32)
      const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', combined))
      next.push(hash)
    }
    leaves = next
  }

  return leaves[0]!
}

export function merkleRootToHex(root: Uint8Array): string {
  return Array.from(root).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function hexToMerkleRoot(hex: string): Uint8Array {
  if (hex.length !== 64) throw new Error('Invalid merkle root hex length')
  const bytes = new Uint8Array(32)
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}
