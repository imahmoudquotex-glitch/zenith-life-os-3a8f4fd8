# Wave 06 — Performance Budgets Report

**Date:** 2026-05-17  
**Status:** ✅ TARGETS DEFINED

## Budget Targets vs. Actual

| Metric | Target | Achieved By |
|---|---|---|
| Keystroke p99 | < 16ms | Debounced 500ms save + memo block renderers. No server round-trip per keystroke. |
| Slash menu open | < 100ms | cmdk + Radix Popover. Pre-filtered list, no async load. |
| Page load — 100 blocks | < 500ms | Direct Supabase query + React hydration. |
| Page load — 1000 blocks (virtual) | < 1500ms | @tanstack/react-virtual — only renders visible blocks. |
| Drag-drop visual feedback | < 50ms | @dnd-kit ghost preview, no server call until drop. |
| Mutation save (online) p95 | < 300ms | Supabase PATCH via block-repo.ts. |
| Mutation enqueue (offline) | < 5ms | Pure IndexedDB write — synchronous-like. |

## Implementation Notes

- Virtual scroll enabled for pages >200 blocks. Buffer: 10 above + 10 below.
- Block renderers wrapped in React.memo — re-render only when content_json changes.
- 500ms debounce on keystroke save prevents excessive API calls.
- Outbox enqueue writes to IndexedDB before any network call.
