import { ASTNode, LiteralNode, IdentifierNode, CallExpressionNode, BinaryExpressionNode, UnaryExpressionNode, PropertyRefNode } from './ast';
import { Tokenizer, Token, TokenType } from './tokenizer';
import { SafeFormulaError } from './safe-error';

export class Parser {
  private tokens: Token[];
  private current: number = 0;

  constructor(input: string) {
    const tokenizer = new Tokenizer(input);
    this.tokens = tokenizer.tokenize();
  }

  public parse(): ASTNode {
    if (this.tokens.length === 0 || this.tokens[0].type === 'EOF') {
      throw new SafeFormulaError('SYNTAX_ERROR', 'Empty expression');
    }
    const node = this.parseExpression();
    if (!this.isAtEnd()) {
      throw new SafeFormulaError('SYNTAX_ERROR', `Unexpected token after expression: ${this.peek().value}`);
    }
    return node;
  }

  private parseExpression(): ASTNode {
    return this.parseLogicalOr();
  }

  private parseLogicalOr(): ASTNode {
    let expr = this.parseLogicalAnd();
    while (this.match('Operator', '||')) {
      const operator = this.previous().value;
      const right = this.parseLogicalAnd();
      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        start: expr.start,
        end: right.end
      } as BinaryExpressionNode;
    }
    return expr;
  }

  private parseLogicalAnd(): ASTNode {
    let expr = this.parseEquality();
    while (this.match('Operator', '&&')) {
      const operator = this.previous().value;
      const right = this.parseEquality();
      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        start: expr.start,
        end: right.end
      } as BinaryExpressionNode;
    }
    return expr;
  }

  private parseEquality(): ASTNode {
    let expr = this.parseComparison();
    while (this.match('Operator', '==', '!=')) {
      const operator = this.previous().value;
      const right = this.parseComparison();
      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        start: expr.start,
        end: right.end
      } as BinaryExpressionNode;
    }
    return expr;
  }

  private parseComparison(): ASTNode {
    let expr = this.parseTerm();
    while (this.match('Operator', '<', '<=', '>', '>=')) {
      const operator = this.previous().value;
      const right = this.parseTerm();
      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        start: expr.start,
        end: right.end
      } as BinaryExpressionNode;
    }
    return expr;
  }

  private parseTerm(): ASTNode {
    let expr = this.parseFactor();
    while (this.match('Operator', '+', '-')) {
      const operator = this.previous().value;
      const right = this.parseFactor();
      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        start: expr.start,
        end: right.end
      } as BinaryExpressionNode;
    }
    return expr;
  }

  private parseFactor(): ASTNode {
    let expr = this.parseUnary();
    while (this.match('Operator', '*', '/')) {
      const operator = this.previous().value;
      const right = this.parseUnary();
      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        start: expr.start,
        end: right.end
      } as BinaryExpressionNode;
    }
    return expr;
  }

  private parseUnary(): ASTNode {
    if (this.match('Operator', '!', '-')) {
      const operator = this.previous().value;
      const start = this.previous().start;
      const right = this.parseUnary();
      return {
        type: 'UnaryExpression',
        operator,
        argument: right,
        start,
        end: right.end
      } as UnaryExpressionNode;
    }
    return this.parseCallOrPrimary();
  }

  private parseCallOrPrimary(): ASTNode {
    const expr = this.parsePrimary();
    if (expr.type === 'Identifier' && this.check('Punctuation', '(')) {
      this.advance(); // consume '('
      const args: ASTNode[] = [];
      if (!this.check('Punctuation', ')')) {
        do {
          args.push(this.parseExpression());
        } while (this.match('Punctuation', ','));
      }
      this.consume('Punctuation', ')', 'Expected ")" after arguments');
      return {
        type: 'CallExpression',
        callee: expr as IdentifierNode,
        arguments: args,
        start: expr.start,
        end: this.previous().end
      } as CallExpressionNode;
    }
    return expr;
  }

  private parsePrimary(): ASTNode {
    if (this.match('String')) {
      return {
        type: 'Literal',
        value: this.previous().value,
        valueType: 'string',
        start: this.previous().start,
        end: this.previous().end
      } as LiteralNode;
    }
    if (this.match('Number')) {
      return {
        type: 'Literal',
        value: parseFloat(this.previous().value),
        valueType: 'number',
        start: this.previous().start,
        end: this.previous().end
      } as LiteralNode;
    }
    if (this.match('Boolean')) {
      return {
        type: 'Literal',
        value: this.previous().value === 'true',
        valueType: 'boolean',
        start: this.previous().start,
        end: this.previous().end
      } as LiteralNode;
    }
    if (this.match('PropertyRef')) {
      return {
        type: 'PropertyRef',
        propertyId: this.previous().value,
        propertyName: this.previous().value, // Simplification: we might need a map to resolve name to ID.
        start: this.previous().start,
        end: this.previous().end
      } as PropertyRefNode;
    }
    if (this.match('Identifier')) {
      return {
        type: 'Identifier',
        name: this.previous().value,
        start: this.previous().start,
        end: this.previous().end
      } as IdentifierNode;
    }
    if (this.match('Punctuation', '(')) {
      const expr = this.parseExpression();
      this.consume('Punctuation', ')', 'Expected ")" after expression.');
      return expr;
    }

    throw new SafeFormulaError('SYNTAX_ERROR', `Unexpected token: ${this.peek().value}`);
  }

  private match(type: TokenType, ...values: string[]): boolean {
    if (this.check(type, ...values)) {
      this.advance();
      return true;
    }
    return false;
  }

  private check(type: TokenType, ...values: string[]): boolean {
    if (this.isAtEnd()) return false;
    const token = this.peek();
    if (token.type !== type) return false;
    if (values.length > 0 && !values.includes(token.value)) return false;
    return true;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === 'EOF';
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, value: string, message: string): Token {
    if (this.check(type, value)) return this.advance();
    throw new SafeFormulaError('SYNTAX_ERROR', message);
  }
}
