# Formula Limits

To ensure robust performance and security for all tenants, Zenith imposes strict limits on formulas.

## Hard Limits
- **Expression Length**: Maximum 2000 characters.
- **AST Nesting Depth**: Maximum 30 levels deep.
- **Property References**: Maximum 50 referenced properties per formula.
- **Timeout**: Hard 50ms evaluation timeout per row.
- **Max Identifier Length**: 64 characters.
- **Max Number Literal Length**: 25 digits.
- **Max String Literal Length**: 500 characters.
- **Iterations (Server-side Evaluator)**: Maximum 10,000 operations per formula execution.
- **Memory Allocation**: Max 5MB of intermediate array values or strings per evaluation.

Any formula breaching these limits will immediately halt execution and return a safe error (e.g., `FORMULA_TIMEOUT` or `FORMULA_DEPTH_EXCEEDED`).
