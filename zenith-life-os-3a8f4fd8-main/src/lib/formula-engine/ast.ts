export type ASTNodeType =
  | 'Literal'
  | 'Identifier'
  | 'CallExpression'
  | 'BinaryExpression'
  | 'UnaryExpression'
  | 'MemberExpression'
  | 'PropertyRef';

export type ValueType = 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object' | 'null';

export interface ASTNode {
  type: ASTNodeType;
  start: number;
  end: number;
}

export interface LiteralNode extends ASTNode {
  type: 'Literal';
  value: any;
  valueType: ValueType;
}

export interface IdentifierNode extends ASTNode {
  type: 'Identifier';
  name: string;
}

export interface PropertyRefNode extends ASTNode {
  type: 'PropertyRef';
  propertyId: string;
  propertyName: string;
}

export interface CallExpressionNode extends ASTNode {
  type: 'CallExpression';
  callee: IdentifierNode;
  arguments: ASTNode[];
}

export interface BinaryExpressionNode extends ASTNode {
  type: 'BinaryExpression';
  operator: string;
  left: ASTNode;
  right: ASTNode;
}

export interface UnaryExpressionNode extends ASTNode {
  type: 'UnaryExpression';
  operator: string;
  argument: ASTNode;
}

export interface MemberExpressionNode extends ASTNode {
  type: 'MemberExpression';
  object: ASTNode;
  property: IdentifierNode | LiteralNode;
  computed: boolean;
}
