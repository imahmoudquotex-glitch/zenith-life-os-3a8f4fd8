import { ASTNode, CallExpressionNode, BinaryExpressionNode, UnaryExpressionNode, PropertyRefNode, LiteralNode, IdentifierNode } from './ast';
import { SafeFormulaError } from './safe-error';
import { functionRegistry } from '../formula-functions/registry';
import type { FormulaValue } from './types';

export interface EvaluationContext {
  properties: Record<string, FormulaValue>;
  vaultProperties?: Set<string>;
  /** Injected server-side timestamp for now() determinism (ADR-0003) */
  runtimeNow?: string;
}

export class Evaluator {
  private readonly ast: ASTNode;
  private readonly timeoutMs: number;
  private startTime: number = 0;
  private opsCount: number = 0;
  private static readonly MAX_OPS = 10_000;

  constructor(ast: ASTNode, timeoutMs: number = 50) {
    this.ast = ast;
    this.timeoutMs = timeoutMs;
  }

  public evaluate(context: EvaluationContext): FormulaValue {
    this.startTime = performance.now();
    this.opsCount = 0;
    return this.visit(this.ast, context);
  }

  private checkBudget(): void {
    this.opsCount++;
    if (this.opsCount > Evaluator.MAX_OPS) {
      throw new SafeFormulaError('TIMEOUT_ERROR', `Formula exceeded ${Evaluator.MAX_OPS} operations limit`);
    }
    if (this.opsCount % 100 === 0) {
      if (performance.now() - this.startTime > this.timeoutMs) {
        throw new SafeFormulaError('TIMEOUT_ERROR', `Formula evaluation exceeded ${this.timeoutMs}ms limit`);
      }
    }
  }

  private visit(node: ASTNode, context: EvaluationContext): FormulaValue {
    this.checkBudget();

    switch (node.type) {
      case 'Literal':
        return (node as LiteralNode).value as FormulaValue;

      case 'Identifier': {
        const name = (node as IdentifierNode).name;
        if (name === 'true') return true;
        if (name === 'false') return false;
        if (name === 'null') return null;
        // Check if it's a special runtime value
        if (name === 'now' && context.runtimeNow) return context.runtimeNow;
        return name;
      }

      case 'PropertyRef': {
        const propId = (node as PropertyRefNode).propertyId;
        if (context.vaultProperties?.has(propId)) {
          throw new SafeFormulaError('VAULT_ACCESS_DENIED', 'Cannot access protected vault property');
        }
        const val = context.properties[propId];
        return val !== undefined ? val : null;
      }

      case 'CallExpression': {
        const callNode = node as CallExpressionNode;
        const funcName = callNode.callee.name;

        // Handle now() with deterministic injection (ADR-0003)
        if (funcName === 'now' && context.runtimeNow) {
          return context.runtimeNow;
        }

        const funcDef = functionRegistry[funcName];
        if (!funcDef) throw new SafeFormulaError('REFERENCE_ERROR', `Function ${funcName} not found`);
        const args = callNode.arguments.map(arg => this.visit(arg, context));
        return funcDef.execute(...args) as FormulaValue;
      }

      case 'BinaryExpression': {
        const binNode = node as BinaryExpressionNode;

        // Short-circuit evaluation
        if (binNode.operator === '&&') {
          const l = this.visit(binNode.left, context);
          return l ? this.visit(binNode.right, context) : l;
        }
        if (binNode.operator === '||') {
          const l = this.visit(binNode.left, context);
          return l ? l : this.visit(binNode.right, context);
        }

        const left = this.visit(binNode.left, context);
        const right = this.visit(binNode.right, context);

        switch (binNode.operator) {
          case '+': {
            if (typeof left === 'number' && typeof right === 'number') return left + right;
            if (typeof left === 'string' || typeof right === 'string') return String(left) + String(right);
            throw new SafeFormulaError('TYPE_ERROR', `Cannot add ${typeof left} and ${typeof right}`);
          }
          case '-': {
            if (typeof left === 'number' && typeof right === 'number') return left - right;
            throw new SafeFormulaError('TYPE_ERROR', `Cannot subtract ${typeof left} and ${typeof right}`);
          }
          case '*': {
            if (typeof left === 'number' && typeof right === 'number') return left * right;
            throw new SafeFormulaError('TYPE_ERROR', `Cannot multiply ${typeof left} and ${typeof right}`);
          }
          case '/': {
            if (typeof left === 'number' && typeof right === 'number') {
              if (right === 0) throw new SafeFormulaError('DIVIDE_BY_ZERO', 'Division by zero');
              return left / right;
            }
            throw new SafeFormulaError('TYPE_ERROR', `Cannot divide ${typeof left} by ${typeof right}`);
          }
          case '==': return left === right;
          case '!=': return left !== right;
          case '>': return (left as number) > (right as number);
          case '<': return (left as number) < (right as number);
          case '>=': return (left as number) >= (right as number);
          case '<=': return (left as number) <= (right as number);
          default: throw new SafeFormulaError('INTERNAL_ERROR', `Unknown operator ${binNode.operator}`);
        }
      }

      case 'UnaryExpression': {
        const unNode = node as UnaryExpressionNode;
        const arg = this.visit(unNode.argument, context);
        switch (unNode.operator) {
          case '!': return !arg;
          case '-': {
            if (typeof arg !== 'number') throw new SafeFormulaError('TYPE_ERROR', `Cannot negate ${typeof arg}`);
            return -arg;
          }
          default: throw new SafeFormulaError('INTERNAL_ERROR', `Unknown unary operator ${unNode.operator}`);
        }
      }

      default:
        throw new SafeFormulaError('INTERNAL_ERROR', `Unknown node type ${node.type}`);
    }
  }
}
