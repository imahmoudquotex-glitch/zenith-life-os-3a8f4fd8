import type { ValueType } from '../formula-engine/ast';

export interface FunctionDefinition {
  name: string;
  minArgs: number;
  maxArgs: number;
  argTypes: ValueType[];
  returnType: ValueType;
  execute: (...args: unknown[]) => unknown;
}

export const functionRegistry: Record<string, FunctionDefinition> = {};

export function registerFunction(def: FunctionDefinition): void {
  if (functionRegistry[def.name]) {
    throw new Error(`Duplicate formula function registration: ${def.name}`);
  }
  functionRegistry[def.name] = def;
}

/**
 * Get total count of registered functions.
 * Used by CI/tests to assert minimum function count.
 */
export function getRegisteredCount(): number {
  return Object.keys(functionRegistry).length;
}
