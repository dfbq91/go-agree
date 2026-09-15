/**
 * Log Sanitizer Contract
 * Clean Architecture Boundary: Infrastructure
 *
 * Defines the contract for sensitive data masking and payload size truncation.
 */

export interface LogSanitizationOptions {
  maxLength?: number;
  obfuscationEnabled?: boolean;
  sensitiveKeys?: string[];
  maxDepth?: number;
}

export interface LogSanitizerPort {
  /**
   * Sanitizes a log payload:
   * 1. Recursively traverses up to maxDepth (default: 5)
   * 2. Masks keys matching sensitive criteria with '[REDACTED]'
   * 3. Truncates strings exceeding maxLength with '[TRUNCATED]'
   * 4. Guards against circular references
   */
  sanitize<T>(data: T, options?: LogSanitizationOptions): T;

  /**
   * Truncates a string if its length exceeds the configured threshold.
   */
  truncateString(value: string, maxLength?: number): string;

  /**
   * Evaluates whether a given property key name is classified as sensitive.
   */
  isSensitiveKey(key: string): boolean;
}
