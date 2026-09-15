import type { LogContext, LoggerPort } from '@go-agree/application';
import {
  PinoLoggerAdapter,
  correlationStorage,
  createPinoInstance,
} from '@go-agree/infrastructure';

const basePino = createPinoInstance();
const baseLogger = new PinoLoggerAdapter(basePino);

export class ContextAwareLogger implements LoggerPort {
  private readonly adapter: LoggerPort;

  constructor(adapter: LoggerPort) {
    this.adapter = adapter;
  }

  private enrichContext(context?: LogContext): LogContext {
    const ambientContext = correlationStorage.getContext();
    if (!ambientContext) {
      return context ?? {};
    }

    return {
      correlationId: ambientContext.correlationId,
      ...(ambientContext.userId ? { userId: ambientContext.userId } : {}),
      ...(ambientContext.contractId ? { contractId: ambientContext.contractId } : {}),
      ...context,
    };
  }

  trace(message: string, context?: LogContext): void {
    this.adapter.trace(message, this.enrichContext(context));
  }

  debug(message: string, context?: LogContext): void {
    this.adapter.debug(message, this.enrichContext(context));
  }

  info(message: string, context?: LogContext): void {
    this.adapter.info(message, this.enrichContext(context));
  }

  warn(message: string, context?: LogContext): void {
    this.adapter.warn(message, this.enrichContext(context));
  }

  error(message: string, context?: LogContext): void {
    this.adapter.error(message, this.enrichContext(context));
  }

  fatal(message: string, context?: LogContext): void {
    this.adapter.fatal(message, this.enrichContext(context));
  }

  child(bindings: LogContext): LoggerPort {
    return new ContextAwareLogger(this.adapter.child(bindings));
  }
}

export const logger: LoggerPort = new ContextAwareLogger(baseLogger);
