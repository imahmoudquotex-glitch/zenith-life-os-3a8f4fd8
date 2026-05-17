import { SafeFormulaError } from './safe-error';

export type TokenType = 
  | 'String' 
  | 'Number' 
  | 'Boolean' 
  | 'Identifier' 
  | 'PropertyRef'
  | 'Operator' 
  | 'Punctuation' 
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  start: number;
  end: number;
}

const OPERATORS = new Set(['+', '-', '*', '/', '==', '!=', '>', '<', '>=', '<=', '&&', '||', '!']);
const PUNCTUATION = new Set(['(', ')', '[', ']', ',', '.']);
const KEYWORDS = new Set(['true', 'false', 'null']);

// Issue #27: Block dangerous identifiers that could enable prototype pollution or code execution
const BLOCKED_IDENTIFIERS = new Set([
  'eval', 'Function', 'constructor', 'prototype', '__proto__',
  'globalThis', 'window', 'document', 'import', 'require', 'process',
  'Proxy', 'Reflect', 'Symbol', 'Object', 'Array',
  'setTimeout', 'setInterval', 'fetch', 'XMLHttpRequest',
  'module', 'exports', '__dirname', '__filename',
]);

export class Tokenizer {
  private input: string;
  private current: number = 0;

  constructor(input: string) {
    this.input = input;
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];
    while (this.current < this.input.length) {
      let char = this.input[this.current];

      if (/\s/.test(char)) {
        this.current++;
        continue;
      }

      if (char === '"' || char === "'") {
        tokens.push(this.readString(char));
        continue;
      }

      if (/[0-9]/.test(char)) {
        tokens.push(this.readNumber());
        continue;
      }

      if (char === 'p' && this.input.startsWith('prop("', this.current)) {
        tokens.push(this.readPropertyRef());
        continue;
      }

      if (/[a-zA-Z_]/.test(char)) {
        tokens.push(this.readIdentifier());
        continue;
      }

      // 2-char operators
      if (this.current + 1 < this.input.length) {
        const twoChar = this.input.substring(this.current, this.current + 2);
        if (OPERATORS.has(twoChar)) {
          tokens.push({ type: 'Operator', value: twoChar, start: this.current, end: this.current + 2 });
          this.current += 2;
          continue;
        }
      }

      if (OPERATORS.has(char)) {
        tokens.push({ type: 'Operator', value: char, start: this.current, end: this.current + 1 });
        this.current++;
        continue;
      }

      if (PUNCTUATION.has(char)) {
        tokens.push({ type: 'Punctuation', value: char, start: this.current, end: this.current + 1 });
        this.current++;
        continue;
      }

      // Dangerous characters check
      if (char === ';' || char === '{' || char === '}' || char === '`') {
        throw new SafeFormulaError('SYNTAX_ERROR', `Dangerous or unsupported character detected: ${char}`);
      }

      throw new SafeFormulaError('SYNTAX_ERROR', `Unexpected character at index ${this.current}: ${char}`);
    }

    tokens.push({ type: 'EOF', value: '', start: this.current, end: this.current });
    return tokens;
  }

  private readString(quote: string): Token {
    const start = this.current;
    this.current++; // skip quote
    let value = '';
    while (this.current < this.input.length && this.input[this.current] !== quote) {
      value += this.input[this.current];
      this.current++;
    }
    if (this.current >= this.input.length) {
      throw new SafeFormulaError('SYNTAX_ERROR', 'Unterminated string literal');
    }
    this.current++; // skip closing quote
    return { type: 'String', value, start, end: this.current };
  }

  private readNumber(): Token {
    const start = this.current;
    let value = '';
    let hasDot = false;
    while (this.current < this.input.length && /[0-9.]/.test(this.input[this.current])) {
      if (this.input[this.current] === '.') {
        if (hasDot) throw new SafeFormulaError('SYNTAX_ERROR', 'Invalid number format');
        hasDot = true;
      }
      value += this.input[this.current];
      this.current++;
    }
    return { type: 'Number', value, start, end: this.current };
  }

  private readIdentifier(): Token {
    const start = this.current;
    let value = '';
    while (this.current < this.input.length && /[a-zA-Z0-9_]/.test(this.input[this.current])) {
      value += this.input[this.current];
      this.current++;
    }

    // Issue #27: Reject dangerous identifiers
    if (BLOCKED_IDENTIFIERS.has(value)) {
      throw new SafeFormulaError('FORBIDDEN_IDENTIFIER', `Forbidden identifier: ${value}`);
    }

    if (KEYWORDS.has(value)) {
      if (value === 'true' || value === 'false') {
        return { type: 'Boolean', value, start, end: this.current };
      }
      return { type: 'Identifier', value, start, end: this.current };
    }
    return { type: 'Identifier', value, start, end: this.current };
  }

  private readPropertyRef(): Token {
    const start = this.current;
    this.current += 6; // skip prop("
    let value = '';
    while (this.current < this.input.length && this.input[this.current] !== '"') {
      value += this.input[this.current];
      this.current++;
    }
    if (this.current >= this.input.length || this.input.substring(this.current, this.current + 2) !== '")') {
      throw new SafeFormulaError('SYNTAX_ERROR', 'Unterminated property reference');
    }
    this.current += 2; // skip ")
    return { type: 'PropertyRef', value, start, end: this.current };
  }
}
