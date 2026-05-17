/**
 * @zenith/formula-engine — Typed Operations
 * Reviewer issue #26: No JS coercion. All operations type-checked.
 */

import type { FormulaValue, FormulaResult, FormulaError } from './types';
import { fNum, fStr, fBool, fNull } from './types';

function err(code: string, message: string): FormulaResult {
  return { ok: false, error: { code, message } };
}

function ok(value: FormulaValue): FormulaResult {
  return { ok: true, value };
}

export function add(a: FormulaValue, b: FormulaValue): FormulaResult {
  if (a.type === "number" && b.type === "number") {
    return ok(fNum(a.value + b.value));
  }
  if (a.type === "string" && b.type === "string") {
    return ok(fStr(a.value + b.value));
  }
  return err("FORMULA_TYPE_MISMATCH", `Cannot add ${a.type} and ${b.type}`);
}

export function subtract(a: FormulaValue, b: FormulaValue): FormulaResult {
  if (a.type === "number" && b.type === "number") {
    return ok(fNum(a.value - b.value));
  }
  return err("FORMULA_TYPE_MISMATCH", `Cannot subtract ${a.type} and ${b.type}`);
}

export function multiply(a: FormulaValue, b: FormulaValue): FormulaResult {
  if (a.type === "number" && b.type === "number") {
    return ok(fNum(a.value * b.value));
  }
  return err("FORMULA_TYPE_MISMATCH", `Cannot multiply ${a.type} and ${b.type}`);
}

export function divide(a: FormulaValue, b: FormulaValue): FormulaResult {
  if (a.type === "number" && b.type === "number") {
    if (b.value === 0) {
      return err("FORMULA_DIVIDE_BY_ZERO", "Division by zero");
    }
    return ok(fNum(a.value / b.value));
  }
  return err("FORMULA_TYPE_MISMATCH", `Cannot divide ${a.type} and ${b.type}`);
}

export function equals(a: FormulaValue, b: FormulaValue): FormulaResult {
  if (a.type !== b.type) return ok(fBool(false));
  return ok(fBool(a.value === b.value));
}

export function notEquals(a: FormulaValue, b: FormulaValue): FormulaResult {
  if (a.type !== b.type) return ok(fBool(true));
  return ok(fBool(a.value !== b.value));
}

export function greaterThan(a: FormulaValue, b: FormulaValue): FormulaResult {
  if (a.type === "number" && b.type === "number") {
    return ok(fBool(a.value > b.value));
  }
  if (a.type === "string" && b.type === "string") {
    return ok(fBool(a.value > b.value));
  }
  return err("FORMULA_TYPE_MISMATCH", `Cannot compare ${a.type} and ${b.type}`);
}

export function lessThan(a: FormulaValue, b: FormulaValue): FormulaResult {
  if (a.type === "number" && b.type === "number") {
    return ok(fBool(a.value < b.value));
  }
  if (a.type === "string" && b.type === "string") {
    return ok(fBool(a.value < b.value));
  }
  return err("FORMULA_TYPE_MISMATCH", `Cannot compare ${a.type} and ${b.type}`);
}

export function greaterThanOrEqual(a: FormulaValue, b: FormulaValue): FormulaResult {
  if (a.type === "number" && b.type === "number") {
    return ok(fBool(a.value >= b.value));
  }
  return err("FORMULA_TYPE_MISMATCH", `Cannot compare ${a.type} and ${b.type}`);
}

export function lessThanOrEqual(a: FormulaValue, b: FormulaValue): FormulaResult {
  if (a.type === "number" && b.type === "number") {
    return ok(fBool(a.value <= b.value));
  }
  return err("FORMULA_TYPE_MISMATCH", `Cannot compare ${a.type} and ${b.type}`);
}

export function negate(a: FormulaValue): FormulaResult {
  if (a.type === "number") {
    return ok(fNum(-a.value));
  }
  return err("FORMULA_TYPE_MISMATCH", `Cannot negate ${a.type}`);
}

export function logicalNot(a: FormulaValue): FormulaResult {
  if (a.type === "boolean") {
    return ok(fBool(!a.value));
  }
  return err("FORMULA_TYPE_MISMATCH", `Cannot negate ${a.type} as boolean`);
}

export function isTruthy(v: FormulaValue): boolean {
  switch (v.type) {
    case "null": return false;
    case "boolean": return v.value;
    case "number": return v.value !== 0;
    case "string": return v.value.length > 0;
    case "date": return true;
    case "array": return v.value.length > 0;
  }
}
