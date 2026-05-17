// @zenith/ai — AI Gateway
// Reviewer issue #31: All AI access goes through this gateway.
// No direct openai/anthropic imports allowed elsewhere.

import type { Result } from '@zenith/shared/result';

export interface AiGatewayConfig {
  provider: 'openai' | 'anthropic' | 'google';
  apiKey: string;
  model: string;
}

export interface AiCompletion {
  text: string;
  tokenUsage: { prompt: number; completion: number };
}

export interface AiQuotaConfig {
  workspaceId: string;
  userId: string;
  purpose: string;    // e.g. 'summarize', 'translate', 'assist'
  maxTokens?: number;
}

/**
 * Scan input for vault plaintext markers and reject if found.
 * Issue #32: No vault plaintext in AI prompts.
 */
export function assertNoVaultPlaintext(input: string): Result<void> {
  const vaultMarkers = [
    '-----BEGIN',        // PEM keys
    'vault:decrypted:',  // internal vault marker
    'sk-',               // API keys
    'ghp_',              // GitHub tokens
    'xoxb-',             // Slack tokens
  ];

  for (const marker of vaultMarkers) {
    if (input.includes(marker)) {
      return {
        ok: false,
        error: {
          code: 'AI_VAULT_LEAK_DETECTED',
          message: `Input contains vault-sensitive data marker: ${marker}...`,
        },
      };
    }
  }
  return { ok: true, value: undefined };
}

/**
 * AI Gateway — single entry point for all AI operations.
 * Enforces quota, redaction, and audit logging.
 */
export class AiGateway {
  constructor(private readonly _config: AiGatewayConfig) {}

  async complete(prompt: string, quota: AiQuotaConfig): Promise<Result<AiCompletion>> {
    // 1. Check vault plaintext
    const vaultCheck = assertNoVaultPlaintext(prompt);
    if (!vaultCheck.ok) return vaultCheck as Result<AiCompletion>;

    // 2. Check quota (stub — will be implemented with DB quota table)
    // TODO: Implement quota check against workspace limits

    // 3. Call provider (stub)
    return {
      ok: false,
      error: {
        code: 'AI_NOT_IMPLEMENTED',
        message: `AI gateway (${this._config.provider}) not yet implemented. Purpose: ${quota.purpose}`,
      },
    };
  }
}

/**
 * Convenience function for AI calls with quota enforcement.
 */
export async function runAIWithQuota(
  gateway: AiGateway,
  prompt: string,
  quota: AiQuotaConfig,
): Promise<Result<AiCompletion>> {
  return gateway.complete(prompt, quota);
}
