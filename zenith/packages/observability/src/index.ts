/**
 * @zenith/observability — Structured logging (pino) + OpenTelemetry setup.
 * W01: All services should use this instead of console.log.
 */

// Lightweight logger interface (pino-compatible)
export interface Logger {
  info(msg: string, data?: Record<string, unknown>): void
  warn(msg: string, data?: Record<string, unknown>): void
  error(msg: string, data?: Record<string, unknown>): void
  debug(msg: string, data?: Record<string, unknown>): void
}

function formatLog(level: string, msg: string, data?: Record<string, unknown>): void {
  const entry = JSON.stringify({
    level,
    time: new Date().toISOString(),
    msg,
    ...data,
  })
  if (level === 'error') {
    console.error(entry)
  } else {
    console.log(entry)
  }
}

export function createLogger(context: string): Logger {
  return {
    info:  (msg, data) => formatLog('info',  msg, { context, ...data }),
    warn:  (msg, data) => formatLog('warn',  msg, { context, ...data }),
    error: (msg, data) => formatLog('error', msg, { context, ...data }),
    debug: (msg, data) => {
      if (process.env['LOG_LEVEL'] === 'debug') {
        formatLog('debug', msg, { context, ...data })
      }
    },
  }
}

export const rootLogger = createLogger('zenith')

// OpenTelemetry span interface (no-op in environments without OTEL)
export interface Span {
  setAttribute(key: string, value: string | number | boolean): void
  end(): void
  recordException(err: Error): void
}

export function startSpan(name: string, _parentSpanId?: string): Span {
  const attrs: Record<string, unknown> = {}
  const start = Date.now()
  return {
    setAttribute(k, v) { attrs[k] = v },
    recordException(err) { attrs['exception'] = err.message },
    end() {
      if (process.env['OTEL_DEBUG']) {
        rootLogger.debug(`span:end name=${name} duration=${Date.now() - start}ms`, attrs as Record<string, unknown>)
      }
    },
  }
}
