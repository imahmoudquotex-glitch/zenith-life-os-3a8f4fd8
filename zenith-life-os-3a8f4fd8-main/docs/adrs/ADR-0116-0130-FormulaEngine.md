# ADR 0116-0130: Formula Engine Architecture (Phase 08)

## ADR 0116: Formula Engine Core Parser
- **Decision**: Implement a custom Recursive Descent Parser instead of leveraging external parsers.
- **Rationale**: Full control over syntax, error reporting, and safe integration with Zenith-specific property references (e.g., `prop("x")`).

## ADR 0117: Custom AST over dynamic eval
- **Decision**: Use a fully typed Abstract Syntax Tree (AST) approach; explicitly block `eval()` and `new Function()`.
- **Rationale**: Mitigates code injection risks, especially important in a multi-tenant SaaS.

## ADR 0118: Type Checker and Safety
- **Decision**: Implement an upfront static type checker that runs before evaluation.
- **Rationale**: Catch type mismatches at authoring time rather than runtime, providing immediate feedback in the UI.

## ADR 0119: Function Registry Extensibility
- **Decision**: Isolate formula functions into modular registries (Text, Logic, Number, Date, Array).
- **Rationale**: Easy expansion and lazy loading of functions, keeping the core evaluator lightweight.

## ADR 0120: DFS Cycle Detection Algorithm
- **Decision**: Use Depth First Search to detect cyclic dependencies among formulas before saving them.
- **Rationale**: Prevent infinite loops that would exhaust resources during calculation.

## ADR 0121: Evaluator Timeout Constraints (50ms)
- **Decision**: Enforce a strict 50ms timeout per formula evaluation.
- **Rationale**: Prevent Denial of Service (DoS) from computationally heavy functions or loops.

## ADR 0122: Recalculation Queue Architecture
- **Decision**: Use an event-driven queue for formula recalculations.
- **Rationale**: Avoid blocking the main request thread when cascading updates occur.

## ADR 0123: Formula Definitions Table and JSONB AST
- **Decision**: Store formula expressions as text and their compiled AST as JSONB in `formula_definitions`.
- **Rationale**: The DB can process or index the JSONB AST directly, removing the need to re-parse at runtime on the backend.

## ADR 0124: DB-fallback vs Redis for Recalc Jobs
- **Decision**: Implement the recalc queue using PostgreSQL (`recalc_jobs`) as the primary fallback, with an optional Redis queue.
- **Rationale**: Simplifies initial deployment without needing extra infrastructure, utilizing existing ACID compliance.

## ADR 0125: Recalculation Materialized Views
- **Decision**: Use a materialized view `formula_dependents_view` to rapidly look up dependent formulas.
- **Rationale**: Fast graph traversal for cascading updates when a root property changes.

## ADR 0126: Database Triggers for Auditing and Caching
- **Decision**: Use PostgreSQL triggers to invalidate the `formula_cache` automatically upon definition updates.
- **Rationale**: Guarantees cache consistency at the database level.

## ADR 0127: Integration with Database Properties
- **Decision**: Extend `db_properties` to reference `formula_id` when the property type is `formula`.
- **Rationale**: Standardizes property lookup while treating formula calculations as a specialized pipeline.

## ADR 0128: RLS Policies for Formula Tables
- **Decision**: Enforce strictly scoped RLS policies based on `workspace_id` for all formula-related tables.
- **Rationale**: Complete multi-tenant data isolation.

## ADR 0129: Zenith UI Editor & Preview
- **Decision**: Build a real-time formula editor with dry-run evaluation capabilities.
- **Rationale**: Enhances user experience by providing instant syntax highlighting and evaluation feedback.

## ADR 0130: Formula Vault Security Isolation
- **Decision**: Isolate the evaluation context from any system-level "Vault" or sensitive credentials.
- **Rationale**: Ensure formulas cannot access database credentials or user secrets even if a bypass is found.
