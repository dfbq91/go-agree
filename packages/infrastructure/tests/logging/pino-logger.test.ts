import { Writable } from 'node:stream';
import { beforeEach, describe, expect, it } from 'vitest';
import { PinoLoggerAdapter } from '../../src/logging/pino-logger.adapter.js';
import { createPinoInstance } from '../../src/logging/transport.js';

describe('PinoLoggerAdapter & Transport', () => {
  let logBuffer: string[] = [];

  const createMemoryStream = () => {
    logBuffer = [];
    return new Writable({
      write(chunk, _encoding, callback) {
        logBuffer.push(chunk.toString());
        callback();
      },
    });
  };

  beforeEach(() => {
    logBuffer = [];
  });

  it('outputs structured JSON with envelope fields (service, level, message, time)', () => {
    const stream = createMemoryStream();
    const pinoInstance = createPinoInstance({
      level: 'info',
      isDevelopment: false,
      destination: stream,
    });
    const logger = new PinoLoggerAdapter(pinoInstance);

    logger.info('User logged in', { userId: 'user-456' });

    expect(logBuffer.length).toBe(1);
    const parsed = JSON.parse(logBuffer[0]);
    expect(parsed.message).toBe('User logged in');
    expect(parsed.level).toBe('info');
    expect(parsed.service).toBe('go-agree');
    expect(parsed.userId).toBe('user-456');
    expect(parsed.time).toBeDefined();
  });

  it('filters log messages below configured severity threshold', () => {
    const stream = createMemoryStream();
    const pinoInstance = createPinoInstance({
      level: 'warn',
      isDevelopment: false,
      destination: stream,
    });
    const logger = new PinoLoggerAdapter(pinoInstance);

    logger.debug('Debug statement');
    logger.info('Info statement');
    logger.warn('Warning statement');
    logger.error('Error statement');

    expect(logBuffer.length).toBe(2);
    const parsed1 = JSON.parse(logBuffer[0]);
    const parsed2 = JSON.parse(logBuffer[1]);
    expect(parsed1.level).toBe('warn');
    expect(parsed1.message).toBe('Warning statement');
    expect(parsed2.level).toBe('error');
    expect(parsed2.message).toBe('Error statement');
  });

  it('serializes standard Error objects properly', () => {
    const stream = createMemoryStream();
    const pinoInstance = createPinoInstance({
      level: 'debug',
      isDevelopment: false,
      destination: stream,
    });
    const logger = new PinoLoggerAdapter(pinoInstance);

    const testError = new Error('Database connection timeout');
    logger.error('Database failure', { error: testError });

    expect(logBuffer.length).toBe(1);
    const parsed = JSON.parse(logBuffer[0]);
    expect(parsed.message).toBe('Database failure');
    expect(parsed.level).toBe('error');
    expect(parsed.error).toBeDefined();
    expect(parsed.error.message).toBe('Database connection timeout');
    expect(parsed.error.stack).toBeDefined();
  });

  it('creates child logger inheriting parent bindings', () => {
    const stream = createMemoryStream();
    const pinoInstance = createPinoInstance({
      level: 'info',
      isDevelopment: false,
      destination: stream,
    });
    const rootLogger = new PinoLoggerAdapter(pinoInstance);
    const childLogger = rootLogger.child({
      correlationId: 'req-abc-123',
      contractId: 'contract-999',
    });

    childLogger.info('Contract analysis initiated');

    expect(logBuffer.length).toBe(1);
    const parsed = JSON.parse(logBuffer[0]);
    expect(parsed.correlationId).toBe('req-abc-123');
    expect(parsed.contractId).toBe('contract-999');
    expect(parsed.message).toBe('Contract analysis initiated');
  });

  it('supports all severity levels (trace, debug, info, warn, error, fatal)', () => {
    const stream = createMemoryStream();
    const pinoInstance = createPinoInstance({
      level: 'trace',
      isDevelopment: false,
      destination: stream,
    });
    const logger = new PinoLoggerAdapter(pinoInstance);

    logger.trace('trace log');
    logger.debug('debug log');
    logger.info('info log');
    logger.warn('warn log');
    logger.error('error log');
    logger.fatal('fatal log');

    expect(logBuffer.length).toBe(6);
    const levels = logBuffer.map((line) => JSON.parse(line).level);
    expect(levels).toEqual(['trace', 'debug', 'info', 'warn', 'error', 'fatal']);
  });
});
