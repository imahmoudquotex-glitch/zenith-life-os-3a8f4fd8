export type FormulaErrorCode = 
  | 'SYNTAX_ERROR'
  | 'TYPE_ERROR'
  | 'REFERENCE_ERROR'
  | 'CYCLE_DETECTED'
  | 'TIMEOUT_ERROR'
  | 'INTERNAL_ERROR'
  | 'DIVIDE_BY_ZERO'
  | 'VAULT_ACCESS_DENIED';

export class SafeFormulaError extends Error {
  public code: FormulaErrorCode;
  public details?: any;

  constructor(code: FormulaErrorCode, message: string, details?: any) {
    super(message);
    this.name = 'SafeFormulaError';
    this.code = code;
    this.details = details;
  }
}
