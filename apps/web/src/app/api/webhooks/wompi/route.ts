import { createApiErrorResponse, withCorrelationContext } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import { getPaymentGatewayResolver, getServerPaymentRepository } from '@/lib/payments';
import { getServerSubscriptionRepository } from '@/lib/subscription';
import { ProcessPaymentWebhookUseCase } from '@go-agree/application';
import { PaymentTamperError } from '@go-agree/domain';
import { correlationStorage } from '@go-agree/infrastructure';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return withCorrelationContext(request, async () => {
    try {
      logger.info('Received Wompi webhook event');
      const rawBody = await request.text();
      let parsedPayload: Record<string, unknown> = {};
      try {
        parsedPayload = JSON.parse(rawBody);
      } catch {
        return createApiErrorResponse('INVALID_JSON', 'Payload must be valid JSON', {
          status: 400,
        });
      }

      const headers: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        headers[key] = value;
      });

      const subRepo = await getServerSubscriptionRepository();
      const paymentRepo = await getServerPaymentRepository();
      const resolver = getPaymentGatewayResolver();

      const useCase = new ProcessPaymentWebhookUseCase(subRepo, paymentRepo, (id) =>
        resolver.resolve(id)
      );

      const result = await useCase.execute({
        providerId: 'wompi',
        rawBody,
        headers,
        parsedPayload,
      });
      logger.info('Webhook processed successfully', {
        status: result.status,
        message: result.message,
      });

      return NextResponse.json(
        {
          received: true,
          status: result.status,
          message: result.message,
        },
        {
          headers: {
            'x-correlation-id': correlationStorage.getCorrelationId(),
          },
        }
      );
    } catch (error: any) {
      logger.error('Error processing webhook event', { error });
      if (error instanceof PaymentTamperError || error?.code === 'PAYMENT_TAMPER_DETECTED') {
        return createApiErrorResponse('CHECKSUM_VERIFICATION_FAILED', error.message, {
          status: 400,
        });
      }

      return createApiErrorResponse(
        'WEBHOOK_PROCESSING_ERROR',
        error?.message || 'Error processing webhook event',
        { status: 500 }
      );
    }
  });
}
