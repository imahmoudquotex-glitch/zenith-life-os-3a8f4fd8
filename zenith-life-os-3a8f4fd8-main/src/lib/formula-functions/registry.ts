import { ValueType } from '../formula-engine/ast';

export interface FunctionDefinition {
  name: string;
  minArgs: number;
  maxArgs: number;
  argTypes: ValueType[]; // if variadic, last type is repeated
  returnType: ValueType;
  execute: (...args: any[]) => any;
}

export const functionRegistry: Record<string, FunctionDefinition> = {};

export function registerFunction(def: FunctionDefinition) {
  functionRegistry[def.name] = def;
}
