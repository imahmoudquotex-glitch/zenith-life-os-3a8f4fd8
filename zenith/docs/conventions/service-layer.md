# Service Layer Conventions

- Business logic resides entirely within `packages/services`.
- Services coordinate between Repositories (`packages/repo`), third-party APIs, and external systems.
- Controllers/Routes must contain zero business logic. They only map HTTP requests to Service methods.
