/**
 * @zenith/ai — Types for runAIWithQuota
 */

export type AIProvider = 'openai' | 'anthropic' | 'google'

export type AIKind = 'text' | 'image' | 'audio' | 'embedding'

export type AIMode = 'fast' | 'reasoning'

export interface AIQuotaContext {
  workspaceId: string
  userId: string
  tier: string
}

export interface AIExecutionContext {
  requestId: string
  timestamp: string
  ipAddress?: string | undefined
}

export interface AIResult<T> {
  ok: boolean
  data?: T | undefined
  error?: {
    code: string
    message: string
  } | undefined
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  provider: AIProvider
  model: string
  latencyMs: number
  piiRedacted?: string[] | undefined
}

export interface RunAIWithQuotaArgs<T> {
  provider: AIProvider
  kind: AIKind
  mode: AIMode
  prompt: string
  quotaContext: AIQuotaContext
  executionContext: AIExecutionContext
  schema?: { parse: (input: unknown) => T } | undefined // ZodSchema<T> compatible
  sensitivity: 'none' | 'low' | 'medium' | 'high'
  model?: string | undefined
  systemPrompt?: string | undefined
  maxTokens?: number | undefined
  parseResult?: ((input: string) => T) | undefined
}

export type RunAIWithQuota = <T>(args: RunAIWithQuotaArgs<T>) => Promise<AIResult<T>>
