/**
 * Cursor Pagination — Opaque cursor-based pagination.
 * Phase 01: ONLY cursor pagination allowed. No offset pagination.
 */

// ─── Types ─────────────────────────────────────────────

export interface CursorPage<T> {
  items: T[]
  cursor: string | null
  hasMore: boolean
  totalCount?: number
}

interface CursorPayload {
  /** Cursor version for forward compatibility */
  v: 1
  /** Last item ID */
  id: string
  /** Last item sort value (e.g., created_at) */
  s: string
}

// ─── Encode/Decode ─────────────────────────────────────

/**
 * Encode a cursor from an ID and sort value.
 * Uses base64url encoding for URL safety.
 */
export function encodeCursor(id: string, sortValue: string): string {
  const payload: CursorPayload = { v: 1, id, s: sortValue }
  // btoa works in both Node 20+ and browsers
  const json = JSON.stringify(payload)
  return btoa(json)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * Decode a cursor back to its components.
 * Returns null if the cursor is invalid.
 */
export function decodeCursor(cursor: string): { id: string; sortValue: string } | null {
  try {
    const padded = cursor
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    const json = atob(padded)
    const payload = JSON.parse(json) as CursorPayload
    if (payload.v !== 1 || !payload.id || !payload.s) return null
    return { id: payload.id, sortValue: payload.s }
  } catch {
    return null
  }
}

/**
 * Build a CursorPage from a list of items.
 * Assumes items are already sorted and limited to `limit + 1`.
 */
export function buildCursorPage<T extends { id: string }>(
  items: T[],
  limit: number,
  getSortValue: (item: T) => string,
  totalCount?: number,
): CursorPage<T> {
  const hasMore = items.length > limit
  const pageItems = hasMore ? items.slice(0, limit) : items
  const lastItem = pageItems[pageItems.length - 1]
  const cursor = lastItem && hasMore ? encodeCursor(lastItem.id, getSortValue(lastItem)) : null

  return {
    items: pageItems,
    cursor,
    hasMore,
    ...(totalCount !== undefined && { totalCount }),
  }
}

/** Default page size */
export const DEFAULT_PAGE_SIZE = 25
/** Maximum page size */
export const MAX_PAGE_SIZE = 100
