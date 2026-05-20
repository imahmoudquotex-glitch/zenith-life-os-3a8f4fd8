// packages/sw/src/index.ts
// Wave: W03 — Public API for sw package

export { shouldNeverCache, NEVER_CACHE_PATTERNS, REQUIRED_DENY_PATHS } from './deny-list';
export { RUNTIME_CACHE_RULES } from './runtime-caching';
export type { CacheRule, CacheStrategy } from './runtime-caching';
export { triggerSwUpdate, onSwUpdateReady } from './update';
