export interface Logger {
  debug: (message: string, context?: Record<string, unknown>) => void;
  info: (message: string, context?: Record<string, unknown>) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
  error: (message: string, context?: Record<string, unknown>) => void;
}

function log(
  level: 'debug' | 'info' | 'warn' | 'error',
  scope: string,
  message: string,
  context?: Record<string, unknown>,
): void {
  const payload = context ? [message, context] : [message];
  const prefix = `[${scope}]`;
  if (level === 'debug') console.debug(prefix, ...payload);
  if (level === 'info') console.info(prefix, ...payload);
  if (level === 'warn') console.warn(prefix, ...payload);
  if (level === 'error') console.error(prefix, ...payload);
}

export function createLogger(scope: string): Logger {
  return {
    debug: (message, context) => log('debug', scope, message, context),
    info: (message, context) => log('info', scope, message, context),
    warn: (message, context) => log('warn', scope, message, context),
    error: (message, context) => log('error', scope, message, context),
  };
}
