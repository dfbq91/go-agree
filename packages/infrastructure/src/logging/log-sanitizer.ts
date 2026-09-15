import { DEFAULT_SENSITIVE_KEYS, parseLoggingConfig } from './config.js';

export interface LogSanitizationOptions {
  maxLength?: number;
  obfuscationEnabled?: boolean;
  sensitiveKeys?: string[];
  maxDepth?: number;
}

export const REDACTED_MARKER = '[REDACTED]';
export const TRUNCATED_SUFFIX = '... [TRUNCATED]';
export const CIRCULAR_MARKER = '[CIRCULAR]';

export class LogSanitizer {
  private readonly defaultMaxLength: number;
  private readonly defaultObfuscationEnabled: boolean;
  private readonly sensitiveKeySet: Set<string>;

  constructor(options: LogSanitizationOptions = {}) {
    const envConfig = parseLoggingConfig();
    this.defaultMaxLength = options.maxLength ?? envConfig.maxLength;
    this.defaultObfuscationEnabled = options.obfuscationEnabled ?? envConfig.obfuscationEnabled;

    const baseKeys = options.sensitiveKeys ?? envConfig.sensitiveKeys ?? DEFAULT_SENSITIVE_KEYS;
    this.sensitiveKeySet = new Set(baseKeys.map((k) => k.toLowerCase().replace(/[^a-z0-9]/g, '')));
  }

  isSensitiveKey(key: string): boolean {
    const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    return this.sensitiveKeySet.has(normalized);
  }

  truncateString(value: string, maxLength: number = this.defaultMaxLength): string {
    if (value.length <= maxLength) {
      return value;
    }
    return value.slice(0, maxLength) + TRUNCATED_SUFFIX;
  }

  sanitize<T>(data: T, options: LogSanitizationOptions = {}): T {
    const maxLength = options.maxLength ?? this.defaultMaxLength;
    const obfuscationEnabled = options.obfuscationEnabled ?? this.defaultObfuscationEnabled;
    const maxDepth = options.maxDepth ?? 5;

    const keyChecker = options.sensitiveKeys
      ? (k: string) => {
          const norm = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          return (
            this.sensitiveKeySet.has(norm) ||
            options.sensitiveKeys?.some(
              (key) => key.toLowerCase().replace(/[^a-z0-9]/g, '') === norm
            )
          );
        }
      : (k: string) => this.isSensitiveKey(k);

    const visited = new WeakSet<object>();

    const traverse = (val: unknown, currentDepth: number): unknown => {
      if (val === null || val === undefined) {
        return val;
      }

      if (typeof val === 'string') {
        return this.truncateString(val, maxLength);
      }

      if (typeof val !== 'object') {
        return val;
      }

      if (val instanceof Date) {
        return val;
      }

      if (val instanceof Error) {
        return {
          name: val.name,
          message: this.truncateString(val.message, maxLength),
          stack: val.stack ? this.truncateString(val.stack, maxLength) : undefined,
          ...(val as any),
        };
      }

      if (visited.has(val)) {
        return CIRCULAR_MARKER;
      }

      if (currentDepth > maxDepth) {
        return val;
      }

      visited.add(val);

      if (Array.isArray(val)) {
        return val.map((item) => traverse(item, currentDepth + 1));
      }

      const sanitizedObj: Record<string, unknown> = {};
      for (const [key, propVal] of Object.entries(val)) {
        if (obfuscationEnabled && keyChecker(key)) {
          sanitizedObj[key] = REDACTED_MARKER;
        } else {
          sanitizedObj[key] = traverse(propVal, currentDepth + 1);
        }
      }

      return sanitizedObj;
    };

    return traverse(data, 0) as T;
  }
}

export const logSanitizer = new LogSanitizer();
