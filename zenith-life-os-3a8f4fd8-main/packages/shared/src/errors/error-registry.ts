// @zenith/shared — Error Registry
// Central error code registry. Every error in the system maps here.

export const ERROR_CODES = {
  // Auth
  AUTH_UNAUTHORIZED: { http: 401, message: 'Authentication required' },
  AUTH_FORBIDDEN: { http: 403, message: 'Insufficient permissions' },
  AUTH_CSRF_INVALID: { http: 403, message: 'Invalid CSRF token' },
  AUTH_SESSION_EXPIRED: { http: 401, message: 'Session expired' },
  AUTH_RATE_LIMITED: { http: 429, message: 'Too many attempts' },
  AUTH_ACCOUNT_LOCKED: { http: 423, message: 'Account locked' },

  // Workspace
  WORKSPACE_NOT_FOUND: { http: 404, message: 'Workspace not found' },
  WORKSPACE_MEMBERSHIP_REQUIRED: { http: 403, message: 'Not a member of this workspace' },

  // DB
  DB_ROW_CREATE_FAILED: { http: 500, message: 'Failed to create row' },
  DB_ROW_NOT_FOUND: { http: 404, message: 'Row not found' },
  DB_QUERY_FAILED: { http: 500, message: 'Database query failed' },

  // Formula
  FORMULA_PARSE_ERROR: { http: 400, message: 'Formula parse error' },
  FORMULA_TYPE_MISMATCH: { http: 400, message: 'Type mismatch in formula' },
  FORMULA_UNKNOWN_FUNCTION: { http: 400, message: 'Unknown function' },
  FORMULA_ARITY_WRONG: { http: 400, message: 'Wrong number of arguments' },
  FORMULA_PROPERTY_NOT_FOUND: { http: 400, message: 'Property not found' },
  FORMULA_CYCLE_DETECTED: { http: 400, message: 'Circular dependency detected' },
  FORMULA_DEPTH_EXCEEDED: { http: 400, message: 'Expression too deeply nested' },
  FORMULA_LENGTH_EXCEEDED: { http: 400, message: 'Expression too long' },
  FORMULA_TIMEOUT: { http: 408, message: 'Formula evaluation timed out' },
  FORMULA_VAULT_ACCESS_DENIED: { http: 403, message: 'Cannot access vault properties in formulas' },
  FORMULA_CROSS_WORKSPACE_DENIED: { http: 403, message: 'Cross-workspace access denied' },
  FORMULA_FORBIDDEN_IDENTIFIER: { http: 400, message: 'Forbidden identifier in formula' },
  FORMULA_OPS_EXCEEDED: { http: 400, message: 'Operation budget exceeded' },
  FORMULA_AST_NOT_ACCEPTED: { http: 400, message: 'Raw AST not accepted; send expression string' },

  // Validation
  VALIDATION_FAILED: { http: 400, message: 'Validation failed' },
  IDEMPOTENCY_CONFLICT: { http: 409, message: 'Duplicate request' },

  // Security
  SECURITY_CSRF_INVALID: { http: 403, message: 'CSRF token invalid' },
  SECURITY_ORIGIN_REJECTED: { http: 403, message: 'Origin not allowed' },

  // General
  INTERNAL_ERROR: { http: 500, message: 'Internal server error' },
  NOT_FOUND: { http: 404, message: 'Resource not found' },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;
