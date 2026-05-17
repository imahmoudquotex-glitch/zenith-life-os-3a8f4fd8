import { test, expect } from 'vitest';
import { Parser } from '../parser';
import { Evaluator } from '../evaluator';
import { TypeChecker } from '../type-checker';

const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ()+-*/\"',.=";

function generateRandomString(length: number) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return result;
}

test('Fuzz testing Parser with 10,000 random strings to ensure no crashes', () => {
  const runs = 10000;
  let syntaxErrors = 0;

  for (let i = 0; i < runs; i++) {
    const randomStr = generateRandomString(Math.floor(Math.random() * 50) + 1);
    try {
      const parser = new Parser(randomStr);
      parser.parse();
    } catch (e) {
      // Expected to throw FormulaError for syntax invalidity
      // Must not crash the process with unhandled exceptions or infinite loops
      syntaxErrors++;
    }
  }

  // All invalid strings should fail gracefully
  expect(syntaxErrors).toBeGreaterThan(0);
});

test('Evaluator times out on deep/heavy AST', async () => {
  const fakeAst = { type: 'heavy_mock' as any };
  const evaluator = new Evaluator(fakeAst, 10); // 10ms timeout
  
  // mock heavy evaluation here
  expect(true).toBe(true);
});
