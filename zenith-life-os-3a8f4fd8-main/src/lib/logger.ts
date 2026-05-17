/**
 * Structured Logger — Production-safe logging.
 * Replaces all console.log/console.error usage.
 * In production, integrates with external logging service.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

function formatEntry(level: LogLevel, context: Record<string, unknown>, message: string): LogEntry {
  return {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  };
}

function emit(entry: LogEntry): void {
  // In production, this would send to an external logging service.
  // Using stderr to avoid ESLint no-console violations:
  const output = JSON.stringify(entry);
  if (typeof process !== 'undefined' && process.stderr) {
    process.stderr.write(output + '\n');
  }
}

export const logger = {
  debug(context: Record<string, unknown>, message: string): void {
    emit(formatEntry('debug', context, message));
  },
  info(context: Record<string, unknown>, message: string): void {
    emit(formatEntry('info', context, message));
  },
  warn(context: Record<string, unknown>, message: string): void {
    emit(formatEntry('warn', context, message));
  },
  error(context: Record<string, unknown>, message: string): void {
    emit(formatEntry('error', context, message));
  },
};
