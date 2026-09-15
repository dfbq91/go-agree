import { withCorrelationContext } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import { correlationStorage } from '@go-agree/infrastructure';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return withCorrelationContext(request, async () => {
    const startTime = Date.now();

    logger.info('Health check received', {
      method: request.method,
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    const healthData = {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      responseTimeMs: Date.now() - startTime,
    };

    return NextResponse.json(healthData, {
      status: 200,
      headers: {
        'x-correlation-id': correlationStorage.getCorrelationId(),
      },
    });
  });
}
