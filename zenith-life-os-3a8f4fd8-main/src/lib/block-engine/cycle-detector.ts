/**
 * Wave 06 — Cycle Detector for Synced Blocks
 * src/lib/block-engine/cycle-detector.ts
 *
 * القواعد:
 * - ❌ synced block reference بدون cycle check
 * - يمنع A→B→A أو أي دورة
 */

export interface SyncedRef {
  blockId: string;
  sourceBlockId: string;
}

/**
 * يتحقق من أن إضافة ref جديدة لن تُنشئ دورة
 * @param refs - كل الـ refs الموجودة
 * @param newRef - الـ ref الجديدة المراد إضافتها
 * @returns true لو ستُنشئ دورة
 */
export function wouldCreateCycle(
  refs: SyncedRef[],
  newRef: SyncedRef
): boolean {
  // بناء graph من كل الـ refs + الجديدة
  const graph = new Map<string, Set<string>>();

  for (const ref of refs) {
    if (!graph.has(ref.blockId)) graph.set(ref.blockId, new Set());
    graph.get(ref.blockId)!.add(ref.sourceBlockId);
  }

  // إضافة الـ ref الجديدة مؤقتاً
  if (!graph.has(newRef.blockId)) graph.set(newRef.blockId, new Set());
  graph.get(newRef.blockId)!.add(newRef.sourceBlockId);

  // DFS للكشف عن cycle من newRef.blockId
  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(node: string): boolean {
    if (stack.has(node)) return true; // cycle found
    if (visited.has(node)) return false;

    visited.add(node);
    stack.add(node);

    for (const neighbor of graph.get(node) ?? []) {
      if (dfs(neighbor)) return true;
    }

    stack.delete(node);
    return false;
  }

  return dfs(newRef.blockId);
}

/**
 * يُرمي exception إذا كان سيحدث cycle
 */
export function assertNoCycle(refs: SyncedRef[], newRef: SyncedRef): void {
  if (newRef.blockId === newRef.sourceBlockId) {
    throw new Error("synced_block_self_reference: block cannot sync to itself");
  }
  if (wouldCreateCycle(refs, newRef)) {
    throw new Error(
      `synced_block_cycle_detected: ${newRef.blockId} -> ${newRef.sourceBlockId} creates a cycle`
    );
  }
}

/**
 * Generic cycle detector for block trees
 * يُستخدم في block-service للتحقق قبل إضافة synced blocks
 * @param nodeIds - كل IDs في الـ graph
 * @param edges - [from, to] pairs
 */
export function detectCycle(
  nodeIds: string[],
  edges: [string, string][]
): boolean {
  const graph = new Map<string, Set<string>>();
  for (const id of nodeIds) {
    graph.set(id, new Set());
  }
  for (const [from, to] of edges) {
    if (!graph.has(from)) graph.set(from, new Set());
    graph.get(from)!.add(to);
  }

  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(node: string): boolean {
    if (stack.has(node)) return true;
    if (visited.has(node)) return false;
    visited.add(node);
    stack.add(node);
    for (const neighbor of graph.get(node) ?? []) {
      if (dfs(neighbor)) return true;
    }
    stack.delete(node);
    return false;
  }

  for (const id of graph.keys()) {
    if (!visited.has(id) && dfs(id)) return true;
  }
  return false;
}
