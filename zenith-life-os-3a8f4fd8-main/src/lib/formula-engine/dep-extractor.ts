import { ASTNode, PropertyRefNode, CallExpressionNode, BinaryExpressionNode, UnaryExpressionNode } from './ast';

export class DepExtractor {
  public static extract(ast: ASTNode): string[] {
    const deps = new Set<string>();
    this.traverse(ast, deps);
    return Array.from(deps);
  }

  private static traverse(node: ASTNode, deps: Set<string>) {
    switch (node.type) {
      case 'PropertyRef':
        deps.add((node as PropertyRefNode).propertyId);
        break;
      case 'CallExpression':
        (node as CallExpressionNode).arguments.forEach(arg => this.traverse(arg, deps));
        break;
      case 'BinaryExpression':
        this.traverse((node as BinaryExpressionNode).left, deps);
        this.traverse((node as BinaryExpressionNode).right, deps);
        break;
      case 'UnaryExpression':
        this.traverse((node as UnaryExpressionNode).argument, deps);
        break;
      // Literals and Identifiers have no dependencies.
    }
  }
}
