# Formulas Convention

## Overview
The Zenith Formula Engine is a highly secure, statically typed, and strictly evaluated language embedded within the platform. It strictly enforces determinism and forbids arbitrary code execution.

## Rules
1. **No dynamic execution**: The use of `eval`, `new Function()`, `Function()`, `setTimeout`, `setInterval`, or dynamic imports is completely forbidden.
2. **Determinism**: Every formula must return the same output for the same input. Time functions like `now()` and `today()` are injected with a snapshot to freeze time for the duration of the evaluation.
3. **No Side Effects**: Formulas are read-only. They cannot mutate the database or file system.
4. **Security**: Formulas cannot reference vaulted (sensitive) properties. Attempts to do so will result in a `FORMULA_VAULT_ACCESS_DENIED` error.

## Architecture
- **Tokenizer**: Sanitizes input, strips dangerous tokens.
- **Parser**: A custom Recursive Descent Parser creates a strongly typed Abstract Syntax Tree (AST).
- **Type Checker**: A static type checker infers types at parse time. Mismatches prevent saving.
- **Evaluator**: A protected execution environment with a 50ms hard timeout.
- **Recalculation**: Asynchronous updates handled via BullMQ / PostgreSQL fallback (`recalc_jobs`).
