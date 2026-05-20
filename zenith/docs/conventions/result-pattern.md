# Result Pattern Conventions

- We do not use `throw` for expected application errors.
- We utilize the `Result<T, AppError>` structure (`Ok(T)`, `Err(AppError)`) for explicit error handling.
- `AppError` maps domain errors to HTTP response codes securely without leaking stack traces to the client.
