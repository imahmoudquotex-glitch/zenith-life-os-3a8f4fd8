# Database Conventions

- Use `BIGINT` for money columns ending in `_cents`. Never use float or numeric.
- All tables must have Row Level Security enabled.
- All RLS policies must strictly enforce `workspace_id = current_workspace_id()`.
- Force RLS on all tenant tables.
