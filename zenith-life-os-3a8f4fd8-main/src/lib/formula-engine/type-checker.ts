import { ASTNode, ValueType, CallExpressionNode, BinaryExpressionNode, UnaryExpressionNode, PropertyRefNode } from './ast';
import { SafeFormulaError } from './safe-error';
import { functionRegistry } from '../formula-functions/registry';

export class TypeChecker {
  private propertyTypes: Record<string, ValueType>;

  constructor(propertyTypes: Record<string, ValueType>) {
    this.propertyTypes = propertyTypes;
  }

  public check(node: ASTNode): ValueType {
    switch (node.type) {
      case 'Literal':
        return (node as any).valueType;
      
      case 'PropertyRef': {
        const propNode = node as PropertyRefNode;
        const type = this.propertyTypes[propNode.propertyId];
        if (!type) {
          throw new SafeFormulaError('TYPE_ERROR', `Unknown property reference: ${propNode.propertyName}`);
        }
        return type;
      }
      
      case 'CallExpression': {
        const callNode = node as CallExpressionNode;
        const funcName = callNode.callee.name;
        const funcDef = functionRegistry[funcName];
        if (!funcDef) {
          throw new SafeFormulaError('REFERENCE_ERROR', `Unknown function: ${funcName}`);
        }
        
        // Basic arity and type checking
        if (callNode.arguments.length < funcDef.minArgs || callNode.arguments.length > funcDef.maxArgs) {
          throw new SafeFormulaError('TYPE_ERROR', `Function ${funcName} expects between ${funcDef.minArgs} and ${funcDef.maxArgs} arguments, got ${callNode.arguments.length}`);
        }

        callNode.arguments.forEach((arg, i) => {
          const argType = this.check(arg);
          const expectedType = funcDef.argTypes[i] || funcDef.argTypes[funcDef.argTypes.length - 1]; // for variadic
          if (expectedType !== 'any' && argType !== expectedType) {
             throw new SafeFormulaError('TYPE_ERROR', `Function ${funcName} argument ${i+1} expects ${expectedType}, got ${argType}`);
          }
        });

        return funcDef.returnType;
      }

      case 'BinaryExpression': {
        const binNode = node as BinaryExpressionNode;
        const leftType = this.check(binNode.left);
        const rightType = this.check(binNode.right);
        
        if (['+', '-', '*', '/'].includes(binNode.operator)) {
          if (leftType !== 'number' || rightType !== 'number') {
             if (binNode.operator === '+' && (leftType === 'string' || rightType === 'string')) return 'string'; // string concat
             throw new SafeFormulaError('TYPE_ERROR', `Operator ${binNode.operator} expects numbers, got ${leftType} and ${rightType}`);
          }
          return 'number';
        }

        if (['==', '!=', '>', '<', '>=', '<='].includes(binNode.operator)) {
          return 'boolean';
        }

        if (['&&', '||'].includes(binNode.operator)) {
          if (leftType !== 'boolean' || rightType !== 'boolean') {
             throw new SafeFormulaError('TYPE_ERROR', `Operator ${binNode.operator} expects booleans`);
          }
          return 'boolean';
        }

        throw new SafeFormulaError('TYPE_ERROR', `Unknown binary operator ${binNode.operator}`);
      }

      case 'UnaryExpression': {
        const unNode = node as UnaryExpressionNode;
        const argType = this.check(unNode.argument);
        
        if (unNode.operator === '!') {
          if (argType !== 'boolean') throw new SafeFormulaError('TYPE_ERROR', `Operator ! expects boolean`);
          return 'boolean';
        }
        if (unNode.operator === '-') {
          if (argType !== 'number') throw new SafeFormulaError('TYPE_ERROR', `Operator - expects number`);
          return 'number';
        }
        
        throw new SafeFormulaError('TYPE_ERROR', `Unknown unary operator ${unNode.operator}`);
      }

      default:
        throw new SafeFormulaError('INTERNAL_ERROR', `Unknown AST node type: ${node.type}`);
    }
  }
}
