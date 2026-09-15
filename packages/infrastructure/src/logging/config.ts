export interface LoggingConfig {
  logLevel: string;
  obfuscationEnabled: boolean;
  sensitiveKeys: string[];
  maxLength: number;
}

export const DEFAULT_SENSITIVE_KEYS: readonly string[] = [
  'password',
  'token',
  'secret',
  'accesstoken',
  'refreshtoken',
  'apikey',
  'authorization',
  'creditcard',
  'cvv',
];

export function parseLoggingConfig(): LoggingConfig {
  const isDev = process.env.NODE_ENV === 'development';
  const logLevel = process.env.LOG_LEVEL || (isDev ? 'debug' : 'info');

  const obfuscationEnabled =
    process.env.LOG_OBFUSCATION_ENABLED !== undefined
      ? process.env.LOG_OBFUSCATION_ENABLED.toLowerCase() !== 'false'
      : true;

  const rawExtraKeys = process.env.LOG_OBFUSCATE_KEYS || '';
  const extraKeys = rawExtraKeys
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  const sensitiveKeys = Array.from(
    new Set([...DEFAULT_SENSITIVE_KEYS, ...extraKeys.map((k) => k.toLowerCase())])
  );

  const rawMaxLength = process.env.LOG_MAX_LENGTH;
  const parsedMaxLength = rawMaxLength ? Number.parseInt(rawMaxLength, 10) : 2048;
  const maxLength = Number.isNaN(parsedMaxLength) || parsedMaxLength <= 0 ? 2048 : parsedMaxLength;

  return {
    logLevel,
    obfuscationEnabled,
    sensitiveKeys,
    maxLength,
  };
}
