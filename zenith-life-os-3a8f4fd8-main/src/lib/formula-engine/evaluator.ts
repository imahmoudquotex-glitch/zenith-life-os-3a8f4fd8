import { ASTNode, CallExpressionNode, BinaryExpressionNode, UnaryExpressionNode, PropertyRefNode, LiteralNode, IdentifierNode } from './ast';
import { SafeFormulaError } from './safe-error';
import { functionRegistry } from '../formula-functions/registry';

export interface EvaluationContext {
  properties: Record<string, any>;
  vaultProperties?: Set<string>; // properties user is not allowed to access
}

export class Evaluator {
  private ast: ASTNode;
  private timeoutMs: number;
  private startTime: number = 0;
  private opsCount: number = 0;

  constructor(ast: ASTNode, timeoutMs: number = 50) {
    this.ast = ast;
    this.timeoutMs = timeoutMs;
  }

  public evaluate(context: EvaluationContext): any {
    // ADR-0003 compatible: uses performance.now() for sub-ms precision
    this.startTime = performance.now();
    this.opsCount = 0;
    return this.visit(this.ast, context);
  }

  private visit(node: ASTNode, context: EvaluationContext): any {
    this.opsCount++;
    // Check timeout every 100 operations to reduce overhead
    if (this.opsCount % 100 === 0) {
      if (performance.now() - this.startTime > this.timeoutMs) {
        throw new SafeFormulaError('TIMEOUT_ERROR', `Formula evaluation exceeded ${this.timeoutMs}ms limit`);
      }
    }

    switch (node.type) {
      case 'Literal':
        return (node as LiteralNode).value;

      case 'Identifier': {
        const name = (node as IdentifierNode).name;
        if (name === 'true') return true;
        if (name === 'false') return false;
        if (name === 'null') return null;
        return name; // passed to functions mostly
      }

      case 'PropertyRef': {
        const propId = (node as PropertyRefNode).propertyId;
        if (context.vaultProperties?.has(propId)) {
          throw new SafeFormulaError('VAULT_ACCESS_DENIED', 'Cannot access protected vault property');
        }
        return context.properties[propId];
      }

      case 'CallExpression': {
        const callNode = node as CallExpressionNode;
        const funcName = callNode.callee.name;
        const funcDef = functionRegistry[funcName];
        if (!funcDef) throw new SafeFormulaError('REFERENCE_ERROR', `Function ${funcName} not found`);
        const args = callNode.arguments.map(arg => this.visit(arg, context));
        return funcDef.execute(...args);
      }

      case 'BinaryExpression': {
        const binNode = node as BinaryExpressionNode;
        // Short-circuiting logic
        if (binNode.operator === '&&') {
          return this.visit(binNode.left, context) && this.visit(binNode.right, context);
        }
        if (binNode.operator === '||') {
          return this.visit(binNode.left, context) || this.visit(binNode.right, context);
        }

        const left = this.visit(binNode.left, context);
        const right = this.visit(binNode.right, context);

        switch (binNode.operator) {
          case '+': return left + right;
          case '-': return left - right;
          case '*': return left * right;
          case '/': 
            if (right === 0) throw new SafeFormulaError('DIVIDE_BY_ZERO', 'Division by zero');
            return left / right;
          case '==': return left === right; // strict equality
          case '!=': return left !== right;
          case '>': return left > right;
          case '<': return left < right;
          case '>=': return left >= right;
          case '<=': return left <= right;
          default: throw new SafeFormulaError('INTERNAL_ERROR', `Unknown operator ${binNode.operator}`);
        }
      }

      case 'UnaryExpression': {
        const unNode = node as UnaryExpressionNode;
        const arg = this.visit(unNode.argument, context);
        switch (unNode.operator) {
          case '!': return !arg;
          case '-': return -arg;
          default: throw new SafeFormulaError('INTERNAL_ERROR', `Unknown unary operator ${unNode.operator}`);
        }
      }

      default:
        throw new SafeFormulaError('INTERNAL_ERROR', `Unknown node type ${node.type}`);
    }
  }
}
