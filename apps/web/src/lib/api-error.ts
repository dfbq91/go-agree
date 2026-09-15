import { correlationStorage } from '@go-agree/infrastructure';
import { NextResponse } from 'next/server';

export interface ApiErrorResponsePayload {
  code: string;
  message: string;
  correlationId: string;
  details?: unknown;
}

export interface ApiErrorResponseOptions {
  status: number;
  headers?: HeadersInit;
  details?: unknown;
  correlationId?: string;
}

export function createApiErrorResponse(
  code: string,
  message: string,
  options: ApiErrorResponseOptions
): NextResponse<ApiErrorResponsePayload> {
  const correlationId = options.correlationId || correlationStorage.getCorrelationId();

  const payload: ApiErrorResponsePayload = {
    code,
    message,
    correlationId,
    ...(options.details !== undefined ? { details: options.details } : {}),
  };

  const responseHeaders = new Headers(options.headers);
  responseHeaders.set('x-correlation-id', correlationId);

  return NextResponse.json(payload, {
    status: options.status,
    headers: responseHeaders,
  });
}

export async function withCorrelationContext<T>(
  request: Request,
  fn: (context: { correlationId: string }) => Promise<T>
): Promise<T> {
  const incomingId = request.headers.get('x-correlation-id');
  const correlationId =
    incomingId && incomingId.trim().length > 0 ? incomingId.trim() : crypto.randomUUID();

  return correlationStorage.runWithContext(
    {
      correlationId,
      startTime: Date.now(),
    },
    () => fn({ correlationId })
  );
}
