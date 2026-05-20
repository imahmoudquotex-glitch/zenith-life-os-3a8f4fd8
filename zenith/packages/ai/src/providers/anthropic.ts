/**
 * Anthropic provider — SOLE location for Anthropic API calls.
 * ADR-0004: No other file may import anthropic SDK outside this package.
 * Timeout: 30s hard limit per call.
 */
import 'server-only'

export interface AnthropicCallArgs {
  model: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  systemPrompt?: string | undefined
  maxTokens?: number | undefined
}

export interface AnthropicCallResult {
  content: string
  usage: { promptTokens: number; completionTokens: number; totalTokens: number }
}

export async function callAnthropic(args: AnthropicCallArgs): Promise<AnthropicCallResult> {
  const apiKey = process.env['ANTHROPIC_API_KEY']
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: args.model,
        max_tokens: args.maxTokens ?? 1024,
        system: args.systemPrompt,
        messages: args.messages,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Anthropic API error ${response.status}: ${err}`)
    }

    const data = await response.json() as {
      content: Array<{ type: string; text: string }>
      usage: { input_tokens: number; output_tokens: number }
    }

    return {
      content: data.content.find(c => c.type === 'text')?.text ?? '',
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
    }
  } finally {
    clearTimeout(timeout)
  }
}
