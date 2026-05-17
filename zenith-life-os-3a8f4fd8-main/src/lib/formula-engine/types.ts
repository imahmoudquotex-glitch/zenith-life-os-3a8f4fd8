/**
 * @zenith/formula-engine — Typed Value System
 * Reviewer issue #24: No `any` in formula engine.
 * All values are discriminated union types.
 */

export type FormulaValue =
  | { readonly type: "null"; readonly value: null }
  | { readonly type: "boolean"; readonly value: boolean }
  | { readonly type: "number"; readonly value: number }
  | { readonly type: "string"; readonly value: string }
  | { readonly type: "date"; readonly value: string }
  | { readonly type: "array"; readonly value: readonly FormulaValue[] };

export interface FormulaError {
  readonly code: string;
  readonly message: string;
}

export type FormulaResult =
  | { readonly ok: true; readonly value: FormulaValue }
  | { readonly ok: false; readonly error: FormulaError };

export function fNull(): FormulaValue {
  return { type: "null", value: null };
}

export function fBool(v: boolean): FormulaValue {
  return { type: "boolean", value: v };
}

export function fNum(v: number): FormulaValue {
  return { type: "number", value: v };
}

export function fStr(v: string): FormulaValue {
  return { type: "string", value: v };
}

export function fDate(v: string): FormulaValue {
  return { type: "date", value: v };
}

export function fArr(v: readonly FormulaValue[]): FormulaValue {
  return { type: "array", value: v };
}

/**
 * Runtime limits for formula evaluation.
 * Passed explicitly — no reliance on Date.now() or Math.random().
 */
export interface FormulaRuntime {
  readonly now: string;           // ISO 8601 snapshot from server clock
  readonly maxOps: number;        // default 10_000
  readonly maxDepth: number;      // default 64
  readonly maxArrayLength: number; // default 10_000
  readonly maxStringLength: number; // default 50_000
}

export const DEFAULT_RUNTIME: FormulaRuntime = {
  now: new Date().toISOString(), // overridden per-request
  maxOps: 10_000,
  maxDepth: 64,
  maxArrayLength: 10_000,
  maxStringLength: 50_000,
};
