# Repository Pattern Conventions

- Database access is strictly confined to `packages/repo`.
- Do not write direct SQL or use Supabase clients directly in route handlers or services.
- Repositories must extend `BaseRepo` or `TenantRepo`.
- `TenantRepo` enforces the PostgreSQL session configuration to match the current tenant via `set_config('app.current_tenant', $1, true)`.
