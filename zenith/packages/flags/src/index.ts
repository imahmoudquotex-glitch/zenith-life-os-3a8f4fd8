/**
 * @zenith/flags — Feature Flags Client
 *
 * ADR-0014: Flags stored in DB + Edge Config.
 * TTL 30s cache. NOTIFY/LISTEN for real-time updates.
 */

export interface FeatureFlag {
  readonly key: string
  readonly enabled: boolean
  readonly rolloutPct: number
  readonly allowList: string[]
  readonly denyList: string[]
}

export interface FeatureFlagsClient {
  /** Check if a flag is enabled for a specific workspace/user */
  isEnabled(key: string, context: { workspaceId: string; userId: string }): Promise<boolean>

  /** Get all flags (cached, TTL 30s) */
  getAll(): Promise<FeatureFlag[]>

  /** Force refresh cache */
  refresh(): Promise<void>
}

/** Known feature flag keys */
export const FLAG_KEYS = {
  AI_V2: 'ai.v2',
  VAULT_SHARING: 'vault.sharing',
  DONATIONS_OPTIONAL: 'donations.optional',
  EXPERIMENTAL_FORMULAS: 'experimental.formulas',
} as const

export type FlagKey = (typeof FLAG_KEYS)[keyof typeof FLAG_KEYS]
