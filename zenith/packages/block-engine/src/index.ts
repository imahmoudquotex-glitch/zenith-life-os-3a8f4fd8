/**
 * @zenith/block-engine — Block tree operations for the page editor.
 * W06: Core engine for create/read/update/delete/move block operations.
 */

// ── Types ────────────────────────────────────────────────────────────────────
export type BlockType =
  | 'text' | 'heading_1' | 'heading_2' | 'heading_3'
  | 'bulleted_list' | 'numbered_list' | 'toggle'
  | 'quote' | 'divider' | 'code' | 'callout'
  | 'image' | 'video' | 'file' | 'embed'
  | 'database' | 'database_view'
  | 'synced_block' | 'template'

export interface BlockContent {
  text?: string
  language?: string           // for code blocks
  caption?: string            // for media
  url?: string                // for embeds
  checked?: boolean           // for to-do
  level?: 1 | 2 | 3          // for headings
  icon?: string               // emoji or URL
  color?: string
  [key: string]: unknown
}

export interface Block {
  id: string
  type: BlockType
  content: BlockContent
  children: Block[]
  parentId: string | null
  pageId: string
  position: string            // fractional index (e.g. "a0")
  createdAt: string
  updatedAt: string
}

// ── Tree operations ──────────────────────────────────────────────────────────

/**
 * Insert a block at a position within parent.
 * Returns the new block with computed fractional position.
 */
export function insertBlock(params: {
  pageId: string
  parentId: string | null
  type: BlockType
  content?: BlockContent
  afterPosition?: string
}): Omit<Block, 'children' | 'createdAt' | 'updatedAt'> {
  const position = params.afterPosition
    ? incrementFractionalIndex(params.afterPosition)
    : 'a0'

  return {
    id: crypto.randomUUID(),
    type: params.type,
    content: params.content ?? {},
    parentId: params.parentId,
    pageId: params.pageId,
    position,
  }
}

/**
 * Move a block to a new parent / position.
 */
export function moveBlock(
  block: Block,
  newParentId: string | null,
  afterPosition?: string,
): Block {
  return {
    ...block,
    parentId: newParentId,
    position: afterPosition
      ? incrementFractionalIndex(afterPosition)
      : 'a0',
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Serialize block tree to flat array (depth-first).
 */
export function serializeTree(roots: Block[]): Block[] {
  const result: Block[] = []
  function traverse(blocks: Block[]): void {
    for (const block of blocks) {
      result.push(block)
      if (block.children.length > 0) traverse(block.children)
    }
  }
  traverse(roots)
  return result
}

/**
 * Deserialize flat array into nested tree.
 */
export function deserializeTree(flat: Block[]): Block[] {
  const map = new Map<string, Block>()
  const roots: Block[] = []

  for (const block of flat) {
    map.set(block.id, { ...block, children: [] })
  }

  for (const block of flat) {
    const node = map.get(block.id)!
    if (block.parentId) {
      const parent = map.get(block.parentId)
      if (parent) {
        parent.children.push(node)
        parent.children.sort((a, b) => a.position.localeCompare(b.position))
      }
    } else {
      roots.push(node)
    }
  }

  return roots.sort((a, b) => a.position.localeCompare(b.position))
}

// ── Fractional indexing ──────────────────────────────────────────────────────
function incrementFractionalIndex(pos: string): string {
  // Simple implementation: append 'b' to push after current position
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  const lastChar = pos[pos.length - 1] ?? 'a'
  const idx = chars.indexOf(lastChar)
  if (idx < chars.length - 1) {
    return pos.slice(0, -1) + chars[idx + 1]
  }
  return pos + 'a'
}
