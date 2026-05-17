// @zenith/ai — AI Gateway (stub)
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

/**
 * AI Gateway — single entry point for all AI operations.
 * Stub implementation for Wave 00.
 */
export class AiGateway {
  constructor(private readonly _config: AiGatewayConfig) {}

  async complete(_prompt: string): Promise<Result<AiCompletion>> {
    // Stub — will be implemented in Wave 09+
    return {
      ok: false,
      error: {
        code: 'AI_NOT_IMPLEMENTED',
        message: 'AI gateway not yet implemented',
      },
    };
  }
}
