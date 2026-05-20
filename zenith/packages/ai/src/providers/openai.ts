/**
 * OpenAI provider — SOLE location for openai imports.
 * ADR-0004: No other file may import from 'openai'.
 * Timeout: 30s hard limit per call.
 */
import 'server-only'

export interface OpenAICallArgs {
  model: string
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  maxTokens?: number | undefined
  temperature?: number | undefined
}

export interface OpenAICallResult {
  content: string
  usage: { promptTokens: number; completionTokens: number; totalTokens: number }
}

export async function callOpenAI(args: OpenAICallArgs): Promise<OpenAICallResult> {
  const apiKey = process.env['OPENAI_API_KEY']
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: args.model,
        messages: args.messages,
        max_tokens: args.maxTokens ?? 1024,
        temperature: args.temperature ?? 0.7,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`OpenAI API error ${response.status}: ${err}`)
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>
      usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
    }

    return {
      content: data.choices[0]?.message?.content ?? '',
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
    }
  } finally {
    clearTimeout(timeout)
  }
}
