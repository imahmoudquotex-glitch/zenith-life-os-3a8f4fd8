/**
 * Logger — Structured pino-compatible logging.
 * Phase 01: All logging through this module.
 * Fields: ts, level, msg, requestId, userId?, workspaceId?, route?, latencyMs?
 *
 * Note: pino will be added as dependency when apps/web is scaffolded.
 * This module provides the interface and a minimal console implementation.
 */

// ─── Types ─────────────────────────────────────────────

export interface LogContext {
  requestId?: string
  userId?: string
  workspaceId?: string
  route?: string
  latencyMs?: number
  [key: string]: unknown
}

export interface Logger {
  debug(msg: string, ctx?: LogContext): void
  info(msg: string, ctx?: LogContext): void
  warn(msg: string, ctx?: LogContext): void
  error(msg: string, ctx?: LogContext): void
  child(bindings: LogContext): Logger
}

// ─── Console Logger (dev/fallback) ─────────────────────

function formatLog(level: string, msg: string, ctx?: LogContext): string {
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...ctx,
  }
  return JSON.stringify(entry)
}

function createConsoleLogger(bindings: LogContext = {}): Logger {
  return {
    debug(msg, ctx) {
      // debug suppressed in production
      if (process.env['NODE_ENV'] !== 'production') {
        // eslint-disable-next-line no-console
        console.log(formatLog('debug', msg, { ...bindings, ...ctx }))
      }
    },
    info(msg, ctx) {
      // eslint-disable-next-line no-console
      console.log(formatLog('info', msg, { ...bindings, ...ctx }))
    },
    warn(msg, ctx) {
      console.warn(formatLog('warn', msg, { ...bindings, ...ctx }))
    },
    error(msg, ctx) {
      console.error(formatLog('error', msg, { ...bindings, ...ctx }))
    },
    child(childBindings) {
      return createConsoleLogger({ ...bindings, ...childBindings })
    },
  }
}

/** Root logger instance */
export const logger: Logger = createConsoleLogger()
