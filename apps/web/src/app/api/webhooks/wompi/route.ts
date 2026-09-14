import { NextResponse } from 'next/server';
import { getServerSubscriptionRepository } from '@/lib/subscription';
import { getServerPaymentRepository, getPaymentGatewayResolver } from '@/lib/payments';
import { ProcessPaymentWebhookUseCase } from '@go-agree/application';
import { PaymentTamperError } from '@go-agree/domain';

export async function POST(request: Request) {
  try {
    console.error('Received Wompi webhook event');
    const rawBody = await request.text();
    let parsedPayload: Record<string, unknown> = {};
    try {
      parsedPayload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { code: 'INVALID_JSON', message: 'Payload must be valid JSON' },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const subRepo = getServerSubscriptionRepository();
    const paymentRepo = getServerPaymentRepository();
    const resolver = getPaymentGatewayResolver();

    const useCase = new ProcessPaymentWebhookUseCase(
      subRepo,
      paymentRepo,
      (id) => resolver.resolve(id)
    );

    const result = await useCase.execute({
      providerId: 'wompi',
      rawBody,
      headers,
      parsedPayload,
    });
    console.info('### Webhook processed successfully:', result);

    return NextResponse.json({
      received: true,
      status: result.status,
      message: result.message,
    });
  } catch (error: any) {
    if (error instanceof PaymentTamperError || error?.code === 'PAYMENT_TAMPER_DETECTED') {
      return NextResponse.json(
        {
          code: 'CHECKSUM_VERIFICATION_FAILED',
          message: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        code: 'WEBHOOK_PROCESSING_ERROR',
        message: error?.message || 'Error processing webhook event',
      },
      { status: 500 }
    );
  }
}
