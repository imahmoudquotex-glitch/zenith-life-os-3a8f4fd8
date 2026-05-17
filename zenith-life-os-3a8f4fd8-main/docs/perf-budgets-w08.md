# Performance Budgets - Wave 08

## Formula Engine Execution
- **Parse + Type-Check**: p95 < 30ms
- **Evaluate Single Row**: p99 < 50ms (Hard timeout enforced at 50ms)
- **Recalculation Batch (1000 rows)**: p95 < 5s
- **Editor Keystroke**: p99 < 16ms (Syntax highlighting and feedback)
- **Autocomplete Suggestions**: < 50ms

## Recalc Queue Limits
- Default worker concurrency: 4
- Maximum recalc batch size: 1000 rows per job.
- Dead-letter handling is built in with exponential backoff on retries.
