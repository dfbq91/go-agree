import { NextResponse } from 'next/server';
import { getServerAuthAdapter } from '@/lib/auth';
import { getServerSubscriptionRepository } from '@/lib/subscription';
import { getServerPaymentRepository, getPaymentGatewayResolver } from '@/lib/payments';
import { getPaymentConfig } from '@/lib/config';
import { InitiatePlanCheckoutUseCase } from '@go-agree/application';
import {
  ActiveSubscriptionExistsError,
  UnsupportedPaymentProviderError,
} from '@go-agree/domain';
import { es } from '@/locales/es';

export async function POST(request: Request) {
  try {
    const authAdapter = getServerAuthAdapter();
    const session = await authAdapter.getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'No authenticated session found' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const planId = body.planId || 'pro';
    const billingCycle = body.billingCycle === 'annual' ? 'annual' : 'monthly';
    const providerId = body.providerId || 'wompi';
    const countryCode = body.countryCode || 'CO';

    const subRepo = getServerSubscriptionRepository();
    const paymentRepo = getServerPaymentRepository();
    const resolver = getPaymentGatewayResolver();
    const config = getPaymentConfig();

    const redirectUrl = `${config.appUrl}/checkout/result`;

    const useCase = new InitiatePlanCheckoutUseCase(
      subRepo,
      paymentRepo,
      (id) => resolver.resolve(id)
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

    return NextResponse.json(result);
  } catch (error: any) {
    if (error instanceof ActiveSubscriptionExistsError || error?.code === 'ACTIVE_SUBSCRIPTION_EXISTS') {
      return NextResponse.json(
        {
          code: 'ALREADY_ACTIVE',
          message: es.checkout.errors.alreadyActive,
        },
        { status: 400 }
      );
    }

    if (error instanceof UnsupportedPaymentProviderError || error?.code === 'UNSUPPORTED_PAYMENT_PROVIDER') {
      return NextResponse.json(
        {
          code: 'UNSUPPORTED_PROVIDER',
          message: error?.message || 'Proveedor de pago no disponible para este país',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        code: 'CHECKOUT_FAILED',
        message: error?.message || es.checkout.errors.checkoutFailed,
      },
      { status: 500 }
    );
  }
}
