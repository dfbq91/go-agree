import { createApiErrorResponse, withCorrelationContext } from '@/lib/api-error';
import { getServerAuthAdapter } from '@/lib/auth';
import { getPaymentConfig } from '@/lib/config';
import { logger } from '@/lib/logger';
import { getPaymentGatewayResolver, getServerPaymentRepository } from '@/lib/payments';
import { getServerSubscriptionRepository } from '@/lib/subscription';
import { es } from '@/locales/es';
import { InitiatePlanCheckoutUseCase } from '@go-agree/application';
import { ActiveSubscriptionExistsError, UnsupportedPaymentProviderError } from '@go-agree/domain';
import { correlationStorage } from '@go-agree/infrastructure';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return withCorrelationContext(request, async () => {
    try {
      const authAdapter = await getServerAuthAdapter();
      const session = await authAdapter.getCurrentSession();
      if (!session) {
        return createApiErrorResponse('UNAUTHORIZED', 'No authenticated session found', {
          status: 401,
        });
      }

      correlationStorage.setUserId(session.userId);

      const body = await request.json().catch(() => ({}));
      const planId = body.planId || 'pro';
      const billingCycle = body.billingCycle === 'annual' ? 'annual' : 'monthly';
      const providerId = body.providerId || 'wompi';
      const countryCode = body.countryCode || 'CO';

      const subRepo = await getServerSubscriptionRepository();
      const paymentRepo = await getServerPaymentRepository();
      const resolver = getPaymentGatewayResolver();
      const config = getPaymentConfig();

      const redirectUrl = `${config.appUrl}/checkout/result`;

      const useCase = new InitiatePlanCheckoutUseCase(subRepo, paymentRepo, (id) =>
        resolver.resolve(id)
      );

      const result = await useCase.execute({
        userId: session.userId,
        customerEmail: body.customerEmail || undefined,
        planId,
        billingCycle,
        providerId,
        redirectUrl,
        countryCode,
      });

      logger.info('Checkout initiated', { userId: session.userId, planId, providerId });

      return NextResponse.json(result, {
        headers: {
          'x-correlation-id': correlationStorage.getCorrelationId(),
        },
      });
    } catch (error: any) {
      logger.error('Failed to initiate checkout', { error });
      if (
        error instanceof ActiveSubscriptionExistsError ||
        error?.code === 'ACTIVE_SUBSCRIPTION_EXISTS'
      ) {
        return createApiErrorResponse('ALREADY_ACTIVE', es.checkout.errors.alreadyActive, {
          status: 400,
        });
      }

      if (
        error instanceof UnsupportedPaymentProviderError ||
        error?.code === 'UNSUPPORTED_PAYMENT_PROVIDER'
      ) {
        return createApiErrorResponse(
          'UNSUPPORTED_PROVIDER',
          error?.message || 'Proveedor de pago no disponible para este país',
          { status: 400 }
        );
      }

      return createApiErrorResponse(
        'CHECKOUT_FAILED',
        error?.message || es.checkout.errors.checkoutFailed,
        { status: 500 }
      );
    }
  });
}
