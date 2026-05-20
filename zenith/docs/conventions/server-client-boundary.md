# Server-Client Boundary Conventions

- Server secrets (`process.env.SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`) must NEVER be imported into a client bundle.
- Rely on `packages/server-env` for all backend server configuration.
- Add `'server-only'` to any package or file that must strictly execute on the server.
- Rely on `packages/client-env` for all frontend safe configurations.
