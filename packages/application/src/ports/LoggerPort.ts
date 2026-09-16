/**
 * Logger Port Contract
 * Clean Architecture Boundary: Application / Infrastructure
 *
 * Defines the contract for structured contextual logging across the application.
 */

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  [key: string]: unknown;
  correlationId?: string;
  userId?: string | null;
  contractId?: string | null;
  error?: Error | unknown;
}

export interface LoggerPort {
  trace(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  fatal(message: string, context?: LogContext): void;

  /**
   * Creates a child logger with bound contextual metadata.
   */
  child(bindings: LogContext): LoggerPort;
}
