/**
 * @file InitiatePlanCheckoutUseCase.ts
 * @description Use case for validating checkout eligibility, creating a pending transaction, and generating a signed checkout redirect URL.
 */

import {
  ActiveSubscriptionExistsError,
  type CountryCode,
  CountryPricingRegistry,
  PaymentProviderRegistry,
  PaymentReferenceService,
  UnsupportedPaymentProviderError,
  UserId,
  UserSubscription,
} from '@go-agree/domain';
import type { PaymentGatewayPort } from '../ports/PaymentGatewayPort.js';
import type { PaymentRepositoryPort } from '../ports/PaymentRepositoryPort.js';
import type { SubscriptionRepositoryPort } from '../ports/SubscriptionRepositoryPort.js';

export interface InitiatePlanCheckoutInput {
  readonly userId: string;
  readonly customerEmail?: string;
  readonly planId: string;
  readonly billingCycle: 'monthly' | 'annual';
  readonly providerId: string;
  readonly redirectUrl: string;
  readonly countryCode?: CountryCode;
}

export interface InitiatePlanCheckoutResult {
  readonly checkoutUrl: string;
  readonly reference: string;
  readonly amount: number;
  readonly currency: string;
  readonly providerId: string;
}

export class InitiatePlanCheckoutUseCase {
  constructor(
    private readonly subscriptionRepo: SubscriptionRepositoryPort,
    private readonly paymentRepo: PaymentRepositoryPort,
    private readonly gatewayResolver: (providerId: string) => PaymentGatewayPort
  ) {}

  async execute(input: InitiatePlanCheckoutInput): Promise<InitiatePlanCheckoutResult> {
    // 1. Verify user subscription eligibility
    const subDTO = await this.subscriptionRepo.getByUserId(input.userId);
    const subscription = UserSubscription.reconstitute({
      id: subDTO.id,
      userId: new UserId(subDTO.userId),
      planType: subDTO.planType,
      status: subDTO.status,
      freeContractsUsed: subDTO.freeContractsUsed,
      startedAt: new Date(subDTO.startedAt),
      expiresAt: subDTO.expiresAt ? new Date(subDTO.expiresAt) : null,
      currentPeriodBillingCycle: subDTO.currentPeriodBillingCycle,
      lastPaymentTransactionId: subDTO.lastPaymentTransactionId,
    });

    if (!subscription.canInitiateCheckout()) {
      throw new ActiveSubscriptionExistsError();
    }

    // 2. Resolve country, pricing plan and currency
    const countryCode = (input.countryCode ?? 'CO').toUpperCase();
    const plan = CountryPricingRegistry.getPlanForCountry(countryCode);

    // Validate that the requested provider is supported for the country
    const supportedProviders = PaymentProviderRegistry.getProvidersForCountry(countryCode);
    const isSupported = supportedProviders.some(
      (p) => p.id.toLowerCase() === input.providerId.toLowerCase()
    );
    if (!isSupported) {
      throw new UnsupportedPaymentProviderError(input.providerId, countryCode);
    }

    const price = input.billingCycle === 'annual' ? plan.annualTotal : plan.monthlyPrice;
    const amountInCents = Math.round(price * 100);
    const currency = plan.currency.code;

    // 3. Generate unique, non-reusable merchant reference
    const reference = PaymentReferenceService.generateReference(input.planId, input.billingCycle);

    // 4. Create pending transaction in storage
    await this.paymentRepo.createTransaction({
      userId: input.userId,
      providerId: input.providerId,
      reference,
      gatewayTransactionId: null,
      planId: input.planId,
      billingCycle: input.billingCycle,
      amount: amountInCents,
      currency,
      status: 'pending',
      paymentMethodType: null,
      rejectionReason: null,
    });

    // 5. Generate signed checkout redirect URL via gateway port
    const gateway = this.gatewayResolver(input.providerId);
    const planLabel =
      input.billingCycle === 'annual' ? `${plan.name} Anual` : `${plan.name} Mensual`;

    let redirectUrl = input.redirectUrl;
    try {
      const urlObj = new URL(input.redirectUrl);
      if (!urlObj.searchParams.has('reference')) {
        urlObj.searchParams.set('reference', reference);
        redirectUrl = urlObj.toString();
      }
    } catch {
      const separator = redirectUrl.includes('?') ? '&' : '?';
      if (!redirectUrl.includes('reference=')) {
        redirectUrl = `${redirectUrl}${separator}reference=${encodeURIComponent(reference)}`;
      }
    }

    const checkoutResult = await gateway.createCheckoutUrl({
      reference,
      amountInCents,
      currency,
      customerEmail: input.customerEmail,
      redirectUrl,
      planName: planLabel,
    });

    return {
      checkoutUrl: checkoutResult.checkoutUrl,
      reference,
      amount: amountInCents,
      currency,
      providerId: input.providerId,
    };
  }
}
