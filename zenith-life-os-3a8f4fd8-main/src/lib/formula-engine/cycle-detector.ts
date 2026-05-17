import { SafeFormulaError } from './safe-error';

export class CycleDetector {
  // Checks if adding dependencies from 'fromId' to 'toIds' creates a cycle
  public static checkCycle(fromId: string, toIds: string[], dependencyMap: Record<string, string[]>): void {
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (node: string) => {
      if (recStack.has(node)) {
        throw new SafeFormulaError('CYCLE_DETECTED', `Circular dependency detected involving property: ${node}`);
      }
      if (visited.has(node)) return;

      visited.add(node);
      recStack.add(node);

      const neighbors = node === fromId ? toIds : (dependencyMap[node] || []);
      for (const neighbor of neighbors) {
        dfs(neighbor);
      }

      recStack.delete(node);
    };

    dfs(fromId);
  }
}
