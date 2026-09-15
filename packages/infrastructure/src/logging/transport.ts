import pino from 'pino';

export interface LoggerTransportOptions {
  level?: string;
  isDevelopment?: boolean;
  destination?: pino.DestinationStream;
}

export function createPinoInstance(options: LoggerTransportOptions = {}): pino.Logger {
  const isDev = options.isDevelopment ?? process.env.NODE_ENV === 'development';
  const level = options.level ?? process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info');

  const baseConfig: pino.LoggerOptions = {
    level,
    base: {
      service: 'go-agree',
    },
    messageKey: 'message',
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label }),
    },
    serializers: {
      error: pino.stdSerializers.err,
    },
  };

  if (options.destination) {
    return pino(baseConfig, options.destination);
  }

  if (isDev) {
    return pino({
      ...baseConfig,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    });
  }

  return pino(baseConfig);
}
