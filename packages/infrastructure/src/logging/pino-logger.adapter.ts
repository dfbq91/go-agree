import type { LogContext, LoggerPort } from '@go-agree/application';
import type pino from 'pino';
import { type LogSanitizer, logSanitizer } from './log-sanitizer.js';

export class PinoLoggerAdapter implements LoggerPort {
  private readonly logger: pino.Logger;
  private readonly sanitizer: LogSanitizer;

  constructor(logger: pino.Logger, sanitizer: LogSanitizer = logSanitizer) {
    this.logger = logger;
    this.sanitizer = sanitizer;
  }

  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined;
    return this.sanitizer.sanitize(context);
  }

  trace(message: string, context?: LogContext): void {
    const sanitized = this.sanitizeContext(context);
    const msg = this.sanitizer.truncateString(message);
    if (sanitized) {
      this.logger.trace(sanitized, msg);
    } else {
      this.logger.trace(msg);
    }
  }

  debug(message: string, context?: LogContext): void {
    const sanitized = this.sanitizeContext(context);
    const msg = this.sanitizer.truncateString(message);
    if (sanitized) {
      this.logger.debug(sanitized, msg);
    } else {
      this.logger.debug(msg);
    }
  }

  info(message: string, context?: LogContext): void {
    const sanitized = this.sanitizeContext(context);
    const msg = this.sanitizer.truncateString(message);
    if (sanitized) {
      this.logger.info(sanitized, msg);
    } else {
      this.logger.info(msg);
    }
  }

  warn(message: string, context?: LogContext): void {
    const sanitized = this.sanitizeContext(context);
    const msg = this.sanitizer.truncateString(message);
    if (sanitized) {
      this.logger.warn(sanitized, msg);
    } else {
      this.logger.warn(msg);
    }
  }

  error(message: string, context?: LogContext): void {
    const sanitized = this.sanitizeContext(context);
    const msg = this.sanitizer.truncateString(message);
    if (sanitized) {
      this.logger.error(sanitized, msg);
    } else {
      this.logger.error(msg);
    }
  }

  fatal(message: string, context?: LogContext): void {
    const sanitized = this.sanitizeContext(context);
    const msg = this.sanitizer.truncateString(message);
    if (sanitized) {
      this.logger.fatal(sanitized, msg);
    } else {
      this.logger.fatal(msg);
    }
  }

  child(bindings: LogContext): LoggerPort {
    const sanitizedBindings = this.sanitizeContext(bindings) ?? {};
    return new PinoLoggerAdapter(this.logger.child(sanitizedBindings), this.sanitizer);
  }
}
