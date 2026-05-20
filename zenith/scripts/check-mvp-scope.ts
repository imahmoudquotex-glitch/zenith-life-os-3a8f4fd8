/**
 * MVP Scope Gate
 * Phase 00 Invariant: Any feature outside MVP_ALLOWED is rejected.
 * Usage: import { assertMvpFeature } from './check-mvp-scope'
 */

const MVP_ALLOWED = new Set([
  'auth',
  'workspace',
  'dashboard',
  'notes',
  'tasks',
  'habits',
  'finance',
  'goals',
  'calendar',
  'search',
  'ai-gateway',
  'vault',
  'settings',
  'pwa',
  'daily-notes',
])

export function assertMvpFeature(feature: string): void {
  if (!MVP_ALLOWED.has(feature)) {
    throw new Error(
      `POST_MVP_FEATURE: "${feature}" is outside MVP scope. ` +
      `Allowed: ${[...MVP_ALLOWED].join(', ')}`,
    )
  }
}

// CLI mode
if (process.argv[1]?.endsWith('check-mvp-scope.ts')) {
  const feature = process.argv[2]
  if (!feature) {
    console.error('Usage: npx tsx scripts/check-mvp-scope.ts <feature-name>')
    process.exit(1)
  }
  try {
    assertMvpFeature(feature)
    console.log(`✅ "${feature}" is within MVP scope`)
  } catch (e) {
    console.error(`❌ ${(e as Error).message}`)
    process.exit(1)
  }
}
