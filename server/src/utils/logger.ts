/**
 * Collex Structured Logger
 * 
 * Simple, production-ready logging utility that standardizes console output
 * across environments without heavy external dependencies.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

function formatMessage(level: LogLevel, message: string, meta?: unknown): string {
  const timestamp = new Date().toISOString();
  const levelTag = level.toUpperCase().padEnd(5);
  const base = `[${timestamp}] [${levelTag}] ${message}`;

  if (meta !== undefined) {
    if (meta instanceof Error) {
      return `${base}\n${meta.stack || meta.message}`;
    }
    if (typeof meta === 'object') {
      try {
        return `${base} ${JSON.stringify(meta)}`;
      } catch {
        return `${base} [Unserializable Object]`;
      }
    }
    return `${base} ${String(meta)}`;
  }

  return base;
}

export const logger = {
  debug(message: string, meta?: unknown) {
    if (LOG_LEVELS[currentLevel] <= LOG_LEVELS.debug) {
      console.debug(formatMessage('debug', message, meta));
    }
  },

  info(message: string, meta?: unknown) {
    if (LOG_LEVELS[currentLevel] <= LOG_LEVELS.info) {
      console.info(formatMessage('info', message, meta));
    }
  },

  warn(message: string, meta?: unknown) {
    if (LOG_LEVELS[currentLevel] <= LOG_LEVELS.warn) {
      console.warn(formatMessage('warn', message, meta));
    }
  },

  error(message: string, meta?: unknown) {
    if (LOG_LEVELS[currentLevel] <= LOG_LEVELS.error) {
      console.error(formatMessage('error', message, meta));
    }
  },
};
