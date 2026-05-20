/**
 * @app/ai — AI Safety Perimeter
 *
 * ADR-0004: ALL AI calls MUST go through runAIWithQuota().
 * Pipeline: redact PII -> reserve quota -> execute -> settle/refund -> audit
 * Timeout: 30s hard limit. Quota: 100 calls/day/user.
 * AI NEVER receives vault plaintext.
 */
import 'server-only'

import { systemClock } from '@zenith/shared/time'
import type { RunAIWithQuotaArgs, AIResult } from './run-ai-with-quota.types.js'
import { redactPII, assertNoVaultContent } from './pii-redactor.js'
import { reserveAIQuota, settleAIQuota, refundAIQuota } from './quota.js'
import { callOpenAI } from './providers/openai.js'
import { callAnthropic } from './providers/anthropic.js'

export * from './run-ai-with-quota.types.js'
export { redactPII, assertNoVaultContent } from './pii-redactor.js'

export async function runAIWithQuota<T>(
  args: RunAIWithQuotaArgs<T>,
): Promise<AIResult<T>> {
  const startMs = systemClock.nowMs()

  // STEP 1: Block high-sensitivity content
  if (args.sensitivity === 'high') {
    return {
      ok: false,
      error: { code: 'AI_HIGH_SENSITIVITY_BLOCKED', message: 'High sensitivity content blocked' },
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      provider: args.provider,
      model: args.model ?? 'unknown',
      latencyMs: 0,
    }
  }

  // STEP 2: PII redaction — mandatory before any AI call
  const promptText = typeof args.prompt === 'string' ? args.prompt : JSON.stringify(args.prompt)
  assertNoVaultContent(promptText)
  const { redacted: safePrompt, piiFound } = redactPII(promptText)

  // STEP 3: Reserve quota atomically
  let reservation: Awaited<ReturnType<typeof reserveAIQuota>> | null = null
  try {
    reservation = await reserveAIQuota(
      args.quotaContext.userId,
      args.quotaContext.workspaceId,
      Math.ceil(safePrompt.length / 4),
    )
  } catch {
    return {
      ok: false,
      error: { code: 'AI_QUOTA_EXCEEDED', message: 'Daily AI quota exceeded (100 calls/day)' },
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      provider: args.provider,
      model: args.model ?? 'unknown',
      latencyMs: systemClock.nowMs() - startMs,
    }
  }

  // STEP 4: Execute with selected provider
  try {
    let result: { content: string; usage: { promptTokens: number; completionTokens: number; totalTokens: number } }

    if (args.provider === 'anthropic') {
      result = await callAnthropic({
        model: args.model ?? 'claude-3-haiku-20240307',
        messages: [{ role: 'user', content: safePrompt }],
        systemPrompt: args.systemPrompt,
        maxTokens: args.maxTokens,
      })
    } else {
      result = await callOpenAI({
        model: args.model ?? 'gpt-4o-mini',
        messages: [
          ...(args.systemPrompt ? [{ role: 'system' as const, content: args.systemPrompt }] : []),
          { role: 'user', content: safePrompt },
        ],
        maxTokens: args.maxTokens,
      })
    }

    // STEP 5: Settle quota on success
    await settleAIQuota(
      reservation.reservationId,
      result.usage.totalTokens,
      'success',
      args.provider,
      args.model,
      systemClock.nowMs() - startMs,
    )

    const parsed = args.parseResult ? args.parseResult(result.content) : (result.content as unknown as T)

    return {
      ok: true,
      data: parsed,
      usage: result.usage,
      provider: args.provider,
      model: args.model ?? 'unknown',
      latencyMs: systemClock.nowMs() - startMs,
      piiRedacted: piiFound.length > 0 ? piiFound : undefined,
    }
  } catch (err) {
    // STEP 5 (failure): Refund quota
    if (reservation) await refundAIQuota(reservation.reservationId).catch(() => {})

    const message = err instanceof Error ? err.message : 'Unknown AI error'
    return {
      ok: false,
      error: { code: 'AI_EXECUTION_FAILED', message },
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      provider: args.provider,
      model: args.model ?? 'unknown',
      latencyMs: systemClock.nowMs() - startMs,
    }
  }
}
